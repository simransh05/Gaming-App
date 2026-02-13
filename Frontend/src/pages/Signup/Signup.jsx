import React from 'react'
import { useEffect } from 'react'
import { CurrentUserContext } from '../../context/UserContext'
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ROUTES from '../../constant/Route/route'
import { useState } from 'react'
import api from '../../utils/api'
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
    Box,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Typography,
    Paper,
} from "@mui/material";

function Signup() {
    const { currentUser } = useContext(CurrentUserContext)
    const navigate = useNavigate()
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [data, setData] = useState(null)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$/;
    const [passwordRules, setPasswordRules] = useState({
        lower: false,
        upper: false,
        number: false,
        length: false,
        symbol: false,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
        setError("");
        if (name === "password") {
            setPasswordRules({
                lower: /[a-z]/.test(value),
                upper: /[A-Z]/.test(value),
                number: /[0-9]/.test(value),
                length: value.length >= 8,
                symbol: /[\W_]/.test(value),
            });
        }
    };

    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    useEffect(() => {
        if (currentUser) navigate(`${ROUTES.HOME}`)
    }, [currentUser])

    const handleSignup = async (e) => {
        e.preventDefault();

        if (data.password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        if (!isValidEmail(data.email)) {
            alert('invalid email');
            return;
        }
        if (!passwordRegex.test(data.password)) {
            alert('invalid type! must be 8–15 characters and include uppercase, lowercase, number, and special character.');
            return;
        }
        try {
            const res = await api.postSignup(data);
            // console.log(res.status);
            navigate(`${ROUTES.LOGIN}`)
        } catch (err) {
            console.log(err.meesage);
        }
    }
    return (
        <Box
            display="flex"
            justifyContent="center"
            borderRadius={"5px"}
            fontFamily={"'Times New Roman', Times, serif"}
            mt={5}
        >
            <Paper elevation={3} sx={{ padding: 4, width: "350px" }}>
                <Typography variant="h5" textAlign="center" mb={2}>
                    Signup
                </Typography>

                <form onSubmit={handleSignup}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        onChange={handleChange}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        name="email"
                        onChange={handleChange}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        onChange={handleChange}
                        margin="normal"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <h4>Password must contains :- </h4>
                    <ul style={{ fontSize: "16px", marginTop: "5px", paddingLeft: "15px" }}>
                        <li style={{ color: passwordRules.lower ? "green" : "red", listStyle: 'none' }}>
                            {passwordRules.lower ? "✔" : "✖"} <span style={{ color: 'black' }}>At least one lowercase letter</span>
                        </li>
                        <li style={{ color: passwordRules.upper ? "green" : "red", listStyle: 'none' }}>
                            {passwordRules.upper ? "✔" : "✖"} <span style={{ color: 'black' }}>At least one uppercase letter </span>
                        </li>
                        <li style={{ color: passwordRules.number ? "green" : "red", listStyle: 'none' }}>
                            {passwordRules.number ? "✔" : "✖"} <span style={{ color: 'black' }}>At least one number </span>
                        </li>
                        <li style={{ color: passwordRules.symbol ? "green" : "red", listStyle: 'none' }}>
                            {passwordRules.symbol ? "✔" : "✖"} <span style={{ color: 'black' }}>At least one special character (# @ % $ ! & *)</span>
                        </li>
                        <li style={{ color: passwordRules.length ? "green" : "red", listStyle: 'none' }}>
                            {passwordRules.length ? "✔" : "✖"} <span style={{ color: 'black' }}>Minimum 8 characters </span>
                        </li>
                    </ul>


                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        margin="normal"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {error && (
                        <Typography color="error" mt={1}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        sx={{ mt: 2 }}
                    >
                        Signup
                    </Button>
                </form>

                <Typography mt={2} textAlign="center">
                    Already have an account? <Link to={ROUTES.LOGIN}>Login</Link>
                </Typography>
            </Paper>
        </Box>
    );
}

export default Signup
