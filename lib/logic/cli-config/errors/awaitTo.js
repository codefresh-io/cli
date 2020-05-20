async function to(fn) {
    try {
        let res;
        if (typeof fn === 'function') {
            res = await fn();
        } else {
            res = await fn;
        }
        return [null, res];
    } catch (err) {
        return [err, null];
    }
}
module.exports = {
    to,
};
