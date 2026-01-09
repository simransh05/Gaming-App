const format = (data) => {
    let rank = 0;
    let prev = null;
    let skip = 1;
    const formatted = data.map((d, idx) => {
        if (prev && d.percentage === prev.percentage && d.totalGames === prev.totalGames) {
            skip++;
        } else {
            rank = rank + skip;
            skip = 1;
        }
        const item = {
            ...d,
            rank: rank
        };

        prev = d;
        return item;
    })
    return formatted;
}

export default format;