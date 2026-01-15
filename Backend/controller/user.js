const User = require('../model/user');
const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken')
module.exports.postSignup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'required all fields' })
        }
        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(404).json({ message: 'user already exist' });
        }
        const hashed = await bycrpt.hash(password, 10);
        let randomNum;
        let exists = true;
        while (exists) {
            randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
            exists = await User.findOne({ playerId: randomNum });
        }
        // console.log(randomNum);
        const user = new User({
            name,
            email,
            password: hashed,
            playerId: randomNum
        })
        await user.save();
        return res.status(200).json({ message: 'success' });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'required all fields' })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'email is not available' })
        }
        const isMatch = await bycrpt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        // console.log(token)
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'Lax',
            secure: false,
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ message: 'successful', user })
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.getUser = async (req, res) => {
    const token = req.cookies.token;
    try {
        // console.log(token)
        if (!token) {
            return res.status(404).json({ message: 'no cookie avaiable' })
        }
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: data.email });
        return res.status(200).json(user);
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.getAllUsers = async (req, res) => {
    const { userId } = req.params;
    try {
        const users = await User.find({
            _id: { $ne: userId }
        })

        return res.status(200).json(users);
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.postLogout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "Lax",
            secure: false,
        });
        return res.status(200).json({ message: 'successfully logout' })
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}