import React from 'react'
import { useEffect } from 'react'
import { CurrentUserContext } from '../../context/UserContext'
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ROUTES from '../../constant/Route/route'
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
} from "@mui/material";
import api from '../../utils/api'
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from 'react'

function Login() {
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext)
    const navigate = useNavigate()
    const [data, setData] = useState(null); 
    const [showPassword, setShowPassword] = useState(false);
    useEffect(() => {
        if (currentUser) navigate(`${ROUTES.HOME}`)
    }, [currentUser])

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.postLogin(data);
            // console.log(res.data);
            setCurrentUser(res.data.user);
            navigate(`${ROUTES.HOME}`)
        } catch (err) {
            if (err.response?.status == "404") {
                navigate(ROUTES.SIGNUP);
            } else {
                alert(err.response?.data?.message || "Login failed!");
            }
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <Box display="flex" justifyContent="center" mt={5}>
            <Paper elevation={3} sx={{ padding: 4, width: "350px" }}>
                <Typography variant="h5" textAlign="center" mb={2}>
                    Login
                </Typography>

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
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

                    <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        sx={{ mt: 2 }}
                    >
                        Login
                    </Button>
                </form>

                <Typography mt={2} textAlign="center">
                    Don’t have an account? <Link to={ROUTES.SIGNUP}>Signup</Link>
                </Typography>
            </Paper>
        </Box>
    );
}

export default Login
