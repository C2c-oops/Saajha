const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const {v4: uuid4} = require('uuid');

let storage = multer.diskStorage({
	destination: (req, files, cb) => cb(null, 'uploads/'),
	filename: (req, file, cb) => {
		const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
	cb(null, uniqueName);
	}
})

let upload = multer({
	storage: storage,
	limits: {fileSize: 1000000 * 100}
}).single('userFile');

router.post('/', (req, res) => {
	
	// store file
	upload(req, res, async (err) => {
		
		// validate request
		if(!req.file) {
			return res.json({
				error: 'All fields are required.'
			})
		}

		if(err) {
			return res.status(500).send({error: err.message})
		}

		// store into DB
		const file = new File({
			filename: req.file.filename,
			uuid: uuid4(),
			path: req.file.path,
			size: req.file.size
		});

		const response = await file.save();
		// response(link for file)
		return res.json({file: `${process.env.APP_BASE_URL_TEST}/files/${response.uuid}`});
		//http://localhost:3000/files/234biabsdhb4-3r4wh4fje
	})
});

router.post('/send', async (req, res) => {
	console.log(req.body);
	const { uuid, senderEmail, receiverEmail } = req.body;

	//Validate request
	if(!uuid || !senderEmail || !receiverEmail) {
		return res.status(422).send({error: 'All fields are required.'});
	}
	
	//getting data from db
	const file = await File.findOne({uuid: uuid});
	if(file.sender) {
		return res.status(422).send({error: 'Email already sent.'});
	}

	file.sender = senderEmail;
	file.receiver = receiverEmail;

	const response = await file.save();

	//send email
	const sendMail = require('../services/emailService');

	sendMail({
		from: senderEmail,
		to: receiverEmail,
		subject: 'Saajha file sharing',
		text: `${senderEmail} shared a file with you.`,
		html: require('../services/emailTemplate')({
			emailFrom: senderEmail,
			downloadLink: `${process.env.APP_BASE_URL_TEST}/files/${file.uuid}`,
			size: parseInt(file.size/1000) + ' KB',
			expires: '24 hours'
		})
	});

	return res.send({success: true});
});

module.exports = router;