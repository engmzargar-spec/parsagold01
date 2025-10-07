import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { IncomingForm } from 'formidable';
import { promisify } from 'util';

// غیرفعال کردن body parser برای FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = promisify((req: any, cb: any) => {
  const form = new IncomingForm({ multiples: false });
  form.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  form.keepExtensions = true;
  form.parse(req, cb);
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const email = formData.get('email')?.toString();
    if (!email) {
      return NextResponse.json({ message: 'ایمیل یافت نشد.' }, { status: 400 });
    }

    const usersDir = path.join(process.cwd(), 'public', 'users');
    const filePath = path.join(usersDir, `${email}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: 'کاربر یافت نشد.' }, { status: 404 });
    }

    const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const documentFile = formData.get('documentFile') as File;
    let savedFileName = '';

    if (documentFile && documentFile.name && documentFile.size > 0) {
      const buffer = Buffer.from(await documentFile.arrayBuffer());
      savedFileName = `${email.replace(/[@.]/g, '_')}.jpg`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', savedFileName);
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

    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');

    return NextResponse.json({ message: 'اطلاعات با موفقیت ذخیره شد.' });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ message: 'خطا در پردازش اطلاعات.' }, { status: 500 });
  }
}
