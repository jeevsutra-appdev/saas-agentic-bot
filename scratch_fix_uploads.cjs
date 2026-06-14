const fs = require('fs');

let content = fs.readFileSync('apps/web/app/c/[tenant]/page.tsx', 'utf8');

// Insert uploadImageToSupabase helper inside the component
const helperCode = `
  const uploadImageToSupabase = async (fileOrBlob: Blob, filename: string = "image.jpg") => {
    try {
      const formData = new FormData();
      formData.append("file", fileOrBlob, filename);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url || "";
    } catch (err) {
      console.error("Upload failed", err);
      return "";
    }
  };
`;

if (!content.includes('uploadImageToSupabase')) {
  content = content.replace(
    /export default function TenantDashboard\(\) {/,
    match => match + helperCode
  );
}

// 1. handleCatImageUpload
content = content.replace(
  /const handleCatImageUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?reader\.readAsDataURL\(file\);\n  };/,
  `const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImageToSupabase(file, file.name);
    if (url) setNewCatImage(url);
  };`
);

// 2. handleEditCatImageUpload
content = content.replace(
  /const handleEditCatImageUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?reader\.readAsDataURL\(file\);\n  };/,
  `const handleEditCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImageToSupabase(file, file.name);
    if (url) setEditCatImage(url);
  };`
);

// 3. handleImageUpload (Product new)
content = content.replace(
  /const handleImageUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?reader\.readAsDataURL\(file\);\n  };/,
  `const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 500; canvas.height = 500;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 500, 500);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const url = await uploadImageToSupabase(blob, file.name || "prod.jpg");
              if (url) setNewProdImage(url);
            }
          }, "image/jpeg", 0.85);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };`
);

// 4. handleEditImageUpload (Product edit)
content = content.replace(
  /const handleEditImageUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?reader\.readAsDataURL\(file\);\n  };/,
  `const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 500; canvas.height = 500;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 500, 500);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const url = await uploadImageToSupabase(blob, file.name || "prod_edit.jpg");
              if (url) setEditProdImage(url);
            }
          }, "image/jpeg", 0.85);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };`
);

// 5. handleBotAvatarUpload
content = content.replace(
  /const handleBotAvatarUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?reader\.readAsDataURL\(file\);\n  };/,
  `const handleBotAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 300; canvas.height = 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 300, 300);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const url = await uploadImageToSupabase(blob, "avatar.jpg");
              if (url) setBotAvatar(url);
            }
          }, "image/jpeg", 0.85);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };`
);

// 6. handleMetaImageUpload
content = content.replace(
  /const handleMetaImageUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?reader\.readAsDataURL\(file\);\n  };/,
  `const handleMetaImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1200; canvas.height = 630;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const imgRatio = img.width / img.height;
          const targetRatio = 1200 / 630;
          let drawWidth = 1200;
          let drawHeight = 630;
          let offsetX = 0;
          let offsetY = 0;
          if (imgRatio > targetRatio) {
            drawWidth = img.height * targetRatio;
            drawHeight = img.height;
            offsetX = (img.width - drawWidth) / 2;
          } else {
            drawWidth = img.width;
            drawHeight = img.width / targetRatio;
            offsetY = (img.height - drawHeight) / 2;
          }
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, 1200, 630);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const url = await uploadImageToSupabase(blob, "meta.jpg");
              if (url) setMetaImage(url);
            }
          }, "image/jpeg", 0.9);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };`
);

fs.writeFileSync('apps/web/app/c/[tenant]/page.tsx', content);
console.log('Successfully refactored image uploads!');
