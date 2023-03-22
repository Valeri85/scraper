const ftp = require('basic-ftp');

async function uploadFileToFTP(localFile, remotePath) {
	const client = new ftp.Client();

	try {
		await client.access({
			host: '<YOUR_FTP_HOST>',
			user: '<YOUR_FTP_USER_USERNAME>',
			password: '<YOUR_FTP_USER_PASSWORD>',
			secure: false,
		});
		await client.uploadFrom(localFile, remotePath);
	} catch (error) {
		console.log(error);
	} finally {
		await client.close();
	}
}

uploadFileToFTP('src/data/data.json', 'data.json');
