import React from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../constant/Route/route";
import { Box, Drawer, Divider } from "@mui/material";
import { FaHome, FaHistory } from "react-icons/fa";
import { MdLeaderboard } from "react-icons/md";
import "./Routes.css";

function RoutesDrawer({ open, onClose }) {
    const navigate = useNavigate();

    const handleClick = (route) => {
        navigate(route);
        onClose();
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 240,
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                    fontFamily: 'sans-serif'
                },
            }}
        >
            <Box className="drawer-header">Menu</Box>

            <Divider />

            <Box className="drawer-items">
                <div className="drawer-item" onClick={() => handleClick(ROUTES.HOME)}>
                    <FaHome />
                    <span>Home</span>
                </div>

                <div
                    className="drawer-item"
                    onClick={() => handleClick(ROUTES.TOP_RANKING)}
                >
                    <MdLeaderboard />
                    <span>Leaderboard</span>
                </div>

                <div
                    className="drawer-item"
                    onClick={() => handleClick(ROUTES.HISTORY)}
                >
                    <FaHistory />
                    <span>Match History</span>
                </div>
            </Box>
        </Drawer>
    );
}

export default RoutesDrawer;