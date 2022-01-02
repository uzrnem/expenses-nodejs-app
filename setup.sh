echo Let\'s initiate installation process...
read -p "Enter Databse Host : " hostname
read -p "Enter Databse Name : " dbname
read -p "Enter User Name : " username
read -p "Enter Password : " password

echo "module.exports = {"  >> 'env.js'
echo "	HOST : '$hostname',"  >> 'env.js'
echo "	DATABASE : '$dbname',"  >> 'env.js'
echo "	USER: '$username',"  >> 'env.js'
echo "	PASSWORD: '$password'"  >> 'env.js'
echo "};"  >> 'env.js'
echo "Setup is completed..!"