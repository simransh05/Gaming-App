const formatDate = (data) => {
    const d = new Date(data);
    return d.toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};

export default formatDate;