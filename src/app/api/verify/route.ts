import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { IncomingForm } from 'formidable';
import { promisify } from 'util';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = promisify((req: any, cb: any) => {
  const form = new IncomingForm({ multiples: false });
  form.keepExtensions = true;
  form.parse(req, cb);
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const phone = formData.get('phone')?.toString();
    if (!phone) {
      return NextResponse.json({ message: 'شماره همراه یافت نشد.' }, { status: 400 });
    }

    const userDir = path.join(process.cwd(), 'public', 'users', phone);
    const profilePath = path.join(userDir, 'profile.json');

    if (!fs.existsSync(profilePath)) {
      return NextResponse.json({ message: 'کاربر یافت نشد.' }, { status: 404 });
    }

    const existingData = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

    const documentFile = formData.get('documentFile') as File;
    let savedFileName = '';

    if (documentFile && documentFile.name && documentFile.size > 0) {
      const buffer = Buffer.from(await documentFile.arrayBuffer());
      const documentsDir = path.join(userDir, 'documents');
      if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true });
      }

      savedFileName = `${Date.now()}-${documentFile.name}`;
      const uploadPath = path.join(documentsDir, savedFileName);
      await writeFile(uploadPath, buffer);
    }

    const updatedData = {
      ...existingData,
      verifiedEmail: formData.get('verifiedEmail') === 'true',
      verifiedPhone: formData.get('verifiedPhone') === 'true',
      gender: formData.get('gender')?.toString() || '',
      address: formData.get('address')?.toString() || '',
      birthDate: formData.get('birthDate')?.toString() || '',
      documentFileName: savedFileName,
    };

    fs.writeFileSync(profilePath, JSON.stringify(updatedData, null, 2), 'utf-8');

    return NextResponse.json({ message: 'اطلاعات با موفقیت ذخیره شد.' });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ message: 'خطا در پردازش اطلاعات.' }, { status: 500 });
  }
}
