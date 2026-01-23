import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../constant/Route/route";
import { Box, Drawer, Divider, Avatar } from "@mui/material";
import { FaHome, FaHistory } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdLeaderboard } from "react-icons/md";
import "./Routes.css";
import api from "../../../utils/api";
import { CurrentUserContext } from "../../../context/UserContext";
import format from "../../../utils/helper/formatRank";
import getInitial from "../../../utils/helper/getInitial";
import { BsFillTrophyFill } from "react-icons/bs";

function RoutesDrawer({ open, onClose }) {
    const navigate = useNavigate();
    const { currentUser, setCurrentUser, loading } = useContext(CurrentUserContext);
    const [ranking, setRanking] = useState(null)

    const handleClick = (route) => {
        navigate(route);
        onClose();
    };

    const logout = async () => {
        const result = await Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            cancelButtonText: 'No',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            icon: 'warning',
            reverseButtons: true
        })
        if (result.isConfirmed) {
            await api.postLogout();
            setCurrentUser(null);
            socket.disconnect();
            navigate(`${ROUTES.LOGIN}`);
        }
    };


    useEffect(() => {
        if (loading) return;
        const fetchRank = async () => {
            const res = await api.getRanking();
            if (res.data.length === 0) {
                setRanking([]);
            } else {
                const data = format(res.data);
                // console.log(data);
                setRanking(data);
            }
        }
        fetchRank()
    }, [loading])

    return (
        <Drawer
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 240,
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                },
            }}
        >
            <Box className='drawer-items head-drawer'>
                {(!ranking || ranking.length === 0) ? <div className='my-rank not-first'>No Rank</div> :
                    (
                        ranking.map((r, idx) => {
                            if (currentUser?._id !== r.userId) return null;

                            if (r.rank === 1) {
                                return (
                                    <div key={idx} className="my-rank">
                                        <BsFillTrophyFill className="trophy" /> <div className="rank-info">Rank #{r.rank}</div>
                                    </div>
                                );
                            }

                            return (
                                <div key={idx} className="my-rank not-first">
                                    Rank #{r.rank}
                                </div>
                            );
                        })
                    )}
                <div className="drawer-items user-data">
                    <Avatar sx={{
                        width: '60px',
                        height: '60px',
                        background: 'lightGreen',
                        color: 'white'
                    }} className='avatar-dp'>{getInitial(currentUser?.name)}</Avatar>

                    <div className="user-info">
                        <span>{currentUser?.name}</span>
                        <span>{currentUser?.email}</span>
                    </div>
                </div>
            </Box>


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
            <Divider />
            <Box className="drawer-items">

                <div onClick={logout} className='drawer-item'>
                    <FiLogOut className='logout' /> Sign Out
                </div>
            </Box>
        </Drawer>
    );
}

export default RoutesDrawer;