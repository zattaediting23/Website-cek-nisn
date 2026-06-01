$source = "C:\Users\admin\OneDrive\Documents\Website cek nisn\frontend"
$dest = "C:\Users\admin\OneDrive\Documents\Website cek nisn\frontend_clean"
New-Item -ItemType Directory -Force -Path $dest
Copy-Item -Path "$source\src" -Destination "$dest" -Recurse -Force
Copy-Item -Path "$source\public" -Destination "$dest" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$source\package.json" -Destination "$dest" -Force
Copy-Item -Path "$source\vite.config.js" -Destination "$dest" -Force
Copy-Item -Path "$source\tailwind.config.js" -Destination "$dest" -Force
Copy-Item -Path "$source\postcss.config.js" -Destination "$dest" -Force
Copy-Item -Path "$source\index.html" -Destination "$dest" -Force
Copy-Item -Path "$source\.env" -Destination "$dest" -Force -ErrorAction SilentlyContinue
cd $dest
npm install
