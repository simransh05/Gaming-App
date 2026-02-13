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

function RoutesDrawer({ open, onClose, onSuccess }) {
    const navigate = useNavigate();
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [ranking, setRanking] = useState(null)

    const handleClick = (route) => {
        navigate(route);
        onClose();
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
    }, [loading]);

    const currentUserInfo = ranking?.find(r => r.userId === currentUser?._id);
    // console.log(currentUserInfo)

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
                {currentUserInfo && currentUserInfo.rank === 1 ? <div className="my-rank">
                    <BsFillTrophyFill className="trophy" /> <div className="rank-info">Rank #{currentUserInfo?.rank}</div>
                </div>
                    :
                    <>
                        {currentUserInfo?.rank &&
                            <div className="my-rank not-first">
                                Rank #{currentUserInfo?.rank}
                            </div>}

                    </>}

                <div className="drawer-items user-data">
                    <Avatar sx={{
                        width: '60px',
                        height: '60px',
                        background: '#F59E0B',
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

                <div onClick={onSuccess} className='drawer-item'>
                    <FiLogOut className='logout' /> Sign Out
                </div>
            </Box>
        </Drawer>
    );
}

export default RoutesDrawer;