# GitHub ga yuklash (PowerShell)
# 1. github.com da yangi repo yarating: albasirtour (Public)
# 2. Quyidagi buyruqlarni ishga tushiring (USERNAME ni o'zingiznikiga almashtiring)

cd c:\yangi-web-main

git -c user.name="Albasirtour" -c user.email="SIZNING-EMAIL@example.com" commit -m "Initial commit: Albasirtour" 2>$null

git branch -M main
git remote add origin https://github.com/USERNAME/albasirtour.git
git push -u origin main

# GitHub login so'rasa — brauzer orqali kirish yoki Personal Access Token ishlating
