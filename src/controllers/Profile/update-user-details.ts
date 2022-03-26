import { Request, Response } from 'express';
import User from '../../models/db-user';
import bcrypt from 'bcrypt';
import Topic from '../../models/topic';

const saltRounds = 10;


/*
 * function to check password matches
 */

const loginCheck = async (password: string, user: DBUser) => {
	try {
		const match = await bcrypt.compare(user.password, password);
		return match;
	} catch (e) {
		console.error('login check failing');
		return 'login check failing';
	}
};

/*
 * function to check new email in correct format
 */

const checkEmail = (email: string) => {
	const reg =
		/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
	return reg.test(email);
};

/*
 * function to check new password in correct format
 */

const checkPassword = (password: string) => {
	if (!password || password.length < 6) return false;
	return /^(?=.*[0-9])(?=.*[a-zA-Z]).+/.test(password);
};

/*
 * function to update user details
 */

export const updateUser = async (req: Request, res: Response) => {
	try {
		if (!req.body.email || !req.body.password) {
			res.status(400);
			res.send('Email or password is missing');
			return;
		}
		const userId: string = req.body.id.id;
		const password: string = req.body.password;
		const currentUser: DBUser | null = await User.findOne({ _id: userId });
		if (currentUser) {
			const match = loginCheck(password, currentUser);
			if (!match) {
				res.status(400);
				res.send('Password is incorrect');
				return;
			}
		  const email: string = req.body.email;
		  if (!checkEmail(email)) {
			  res.status(400);
			  res.send('Email is not in the required format');
			  return;
		  }
  		const displayName: string = req.body.displayName;
	  	const avatar: string = req.body.avatar;
			let newPassword: string = '';
			let hashPassword: string = '';
		  if (req.body.newPassword) newPassword = req.body.newPassword;
			if (newPassword) {
				if (!checkPassword(newPassword)) {
					res.status(400);
					res.send('New password must be 6 or more characters and contain at least one number');
					return;
				} else {
					hashPassword = await bcrypt.hash(newPassword, saltRounds);
					currentUser.password = hashPassword
				}
			}
			if (email !== currentUser.email) currentUser.email = email;
			let avatarChanged: boolean = false;
			let displayChanged: boolean = false;
			if (avatar && avatar !== currentUser.avatar) {
				currentUser.avatar = avatar;
				avatarChanged = true;
			}
			if (displayName && displayName !== currentUser.displayName) {
				currentUser.displayName = displayName;
				displayChanged = true;
			}
			const newUser: DBUser | null = await User.findOneAndUpdate({ _id: userId }, { $set: currentUser }, {new: true});
			res.status(200);
			res.send(newUser);
			if (avatarChanged) {
				await Topic.updateMany();
			};
		}
	} catch (e: any) {
		if (e.code === 11000) {
			console.error(e, 'Email or display name already in use, please choose another');
		}
		console.error('updateUser is failing');
		res.status(500);
	}
};