const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');

const app = express();

// 🔑 ضع معلومات البوت وتطبيق Discord الخاصة بك هنا
const CLIENT_ID = 'ضع_CLIENT_ID_هنا';
const CLIENT_SECRET = 'ضع_CLIENT_SECRET_هنا';
const REDIRECT_URI = 'http://localhost:3000/auth/discord/callback';

// إعداد خيارات تسجيل الدخول عبر ديسكورد
passport.use(new DiscordStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: REDIRECT_URI,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// إعداد الجلسات (Sessions)
app.use(session({
    secret: 'secret_key_discord_bot_dashboard',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// إتاحة الملفات الإستاتيكية مثل index.html
app.use(express.static(path.join(__dirname, 'public')));

// مسارات تسجيل الدخول عبر ديسكورد
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/');
});

// API لجلب بيانات المستخدم والسيرفرات
app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ authenticated: false });
    }
    
    // إرسال بيانات المستخدم والسيرفرات
    res.json({
        authenticated: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            avatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`
        },
        guilds: req.user.guilds
    });
});

// تسجيل الخروج
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 يعمل الموقع والداشبورد الآن على: http://localhost:${PORT}`);
});
