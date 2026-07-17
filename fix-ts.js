const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/(admin)/media/page.tsx',
  'app/(admin)/menus/[id]/page.tsx',
  'app/(admin)/menus/page.tsx',
  'app/(admin)/pages/page.tsx',
  'app/(admin)/posts/page.tsx',
  'app/(admin)/tags/page.tsx',
  'components/admin/BlockEditor/BlockEditor.tsx',
  'components/admin/delete-user-button.tsx',
  'components/admin/MediaPicker/MediaPicker.tsx',
  'components/site/Header.tsx',
  'components/site/Footer.tsx'
];

for (const file of filesToFix) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix asChild for Button, DropdownMenuItem, SheetTrigger, DialogTrigger, AlertDialogTrigger
  content = content.replace(/asChild/g, '');

  // Fix globals type casting in Header and Footer
  if (file.includes('Header.tsx')) {
    content = content.replace('await getGlobal("header")', '(await getGlobal("header")) as any');
    content = content.replace(/asChild/g, ''); // just in case
  }
  if (file.includes('Footer.tsx')) {
    content = content.replace('await getGlobal("footer")', '(await getGlobal("footer")) as any');
  }

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
}
