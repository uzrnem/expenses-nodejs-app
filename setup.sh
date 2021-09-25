echo Let\'s initiate installation process...
read -p "Enter Databse name : " dbname
read -p "Enter User name : " username
read -p "Enter Password : " password

echo "module.exports = {"  >> 'env.js'
echo "	DATABASE : '$dbname',"  >> 'env.js'
echo "	USER: '$username',"  >> 'env.js'
echo "	PASSWORD: '$password'"  >> 'env.js'
echo "};"  >> 'env.js'
echo "Setup is completed..!"

#read varname
#	USER_NAME : "root",
#	PASSWORD : "toor",
