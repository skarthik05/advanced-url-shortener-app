export const checkUserId = (req, res, next) => {
    const { _id } = req?.user || {};
    if (!_id) {
        if(req.useragent.isMobile || req.useragent.browser!=='unknown')
        return res.redirect('/api/auth/google');
        else 
        return res.json({message: 'please login to continue',link: `${req.protocol}://${req.get('host')}/api/auth/google`});
    }
    next();
};
export default checkUserId;