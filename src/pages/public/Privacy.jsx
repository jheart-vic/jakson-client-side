import { Link } from 'react-router-dom'
import { Shield, ArrowLeft, ChevronRight } from 'lucide-react'

const SECTIONS = [
    {
        title: '1. Information We Collect',
        content: [
            {
                subtitle: 'Account Information',
                text: 'When you register on Luminos Energy, we collect your phone number, full name (optional), username (optional), and a securely hashed password. This information is required to create and manage your account.',
            },
            {
                subtitle: 'Financial Information',
                text: 'To process withdrawals, we collect your Nigerian bank account details including account number and bank name. We do not store card numbers or card CVVs. Bank account details are used solely for processing withdrawal requests.',
            },
            {
                subtitle: 'Usage Data',
                text: 'We collect information about how you interact with our platform, including login times, investment activity, withdrawal requests, referral activity, and daily claim history. This data helps us maintain platform integrity and detect fraudulent activity.',
            },
            {
                subtitle: 'Device & Technical Data',
                text: 'We may collect your IP address, browser type, and device information when you access our platform. This is used for security monitoring and fraud prevention only.',
            },
        ],
    },
    {
        title: '2. How We Use Your Information',
        content: [
            {
                subtitle: 'Platform Operations',
                text: 'Your information is used to operate your account, process investments, calculate and credit daily income, and execute withdrawal requests to your registered bank account.',
            },
            {
                subtitle: 'Security & Fraud Prevention',
                text: 'We use your data to verify your identity, detect suspicious activity, enforce our one-account-per-user policy, and protect the integrity of the referral program.',
            },
            {
                subtitle: 'Communications',
                text: 'We may contact you via phone or our in-app notification system regarding account activity, income credits, withdrawal status updates, and important platform announcements. We do not send unsolicited marketing messages.',
            },
            {
                subtitle: 'Referral Program',
                text: 'If you were referred by another user, we record the relationship to correctly attribute referral commissions. Your referrer can see that you joined via their link but cannot see your balance, password, or withdrawal details.',
            },
        ],
    },
    {
        title: '3. Data Storage & Security',
        content: [
            {
                subtitle: 'Encryption',
                text: 'All passwords, withdrawal passwords, and security answers are hashed using bcrypt before storage. They are never stored in plain text and cannot be read by our staff.',
            },
            {
                subtitle: 'Database Security',
                text: 'Your data is stored on secure, access-controlled cloud servers. Database access is restricted to authorized personnel only and is protected by IP whitelisting and strong authentication.',
            },
            {
                subtitle: 'Data Retention',
                text: 'We retain your account data for as long as your account is active. If you request account closure, your personal data will be deleted within 30 days, subject to any legal obligations to retain financial records.',
            },
        ],
    },
    {
        title: '4. Sharing of Information',
        content: [
            {
                subtitle: 'We Do Not Sell Your Data',
                text: 'Luminos Energy does not sell, rent, or trade your personal information to third parties for marketing purposes. Your data is not shared with advertisers.',
            },
            {
                subtitle: 'Service Providers',
                text: 'We may share limited data with trusted third-party service providers who assist us in operating the platform, such as payment processors and cloud infrastructure providers. These providers are contractually bound to protect your data.',
            },
            {
                subtitle: 'Legal Requirements',
                text: 'We may disclose your information if required to do so by Nigerian law, court order, or regulatory authority, or when we believe disclosure is necessary to protect our rights or prevent fraud.',
            },
        ],
    },
    {
        title: '5. Your Rights',
        content: [
            {
                subtitle: 'Access & Correction',
                text: 'You may update your profile information, including your full name and username, from within the app at any time. To correct your registered phone number, contact our support team.',
            },
            {
                subtitle: 'Account Deletion',
                text: 'You may request deletion of your account by contacting us via our Telegram or WhatsApp support channels. We will process your request within 30 days. Note that any pending investments or unclaimed income will be forfeited upon account deletion.',
            },
            {
                subtitle: 'Data Portability',
                text: 'You may request a summary of the personal data we hold about you by contacting our support team. We will provide this within 14 business days.',
            },
        ],
    },
    {
        title: '6. Cookies & Tracking',
        content: [
            {
                subtitle: 'Session Management',
                text: 'We use secure HTTP-only cookies solely for authentication session management. We do not use third-party tracking cookies or advertising cookies.',
            },
            {
                subtitle: 'No Third-Party Analytics',
                text: 'We do not embed third-party analytics scripts (such as Google Analytics) that track your behaviour across other websites.',
            },
        ],
    },
    {
        title: '7. Children\'s Privacy',
        content: [
            {
                subtitle: 'Age Restriction',
                text: 'Luminos Energy is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has created an account, we will immediately deactivate and delete it.',
            },
        ],
    },
    {
        title: '8. Changes to This Policy',
        content: [
            {
                subtitle: 'Updates',
                text: 'We may update this Privacy Policy from time to time. When we make material changes, we will notify users via the app or our Telegram community. Continued use of the platform after changes are posted constitutes acceptance of the updated policy.',
            },
        ],
    },
    {
        title: '9. Contact Us',
        content: [
            {
                subtitle: 'Get in Touch',
                text: 'If you have questions about this Privacy Policy or how we handle your data, please contact us via our Telegram community at t.me/Luminosenergy or via WhatsApp support.',
            },
        ],
    },
]

const Privacy = () => {
    return (
        <div className='min-h-screen' style={{ background: '#f5f3ef', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

            {/* ── Header ── */}
            <div style={{ background: 'linear-gradient(135deg,#1C1A18 0%,#2D1F0E 100%)' }}>
                <div className='max-w-4xl mx-auto px-4 py-12'>
                    <Link
                        to='/'
                        className='inline-flex items-center gap-2 text-white/50 hover:text-white text-sm font-semibold transition-colors mb-8'
                    >
                        <ArrowLeft size={15} /> Back to Home
                    </Link>

                    <div className='flex items-center gap-4 mb-4'>
                        <div
                            className='w-12 h-12 rounded-2xl flex items-center justify-center shrink-0'
                            style={{ background: 'rgba(198,123,44,0.2)', border: '1px solid rgba(198,123,44,0.3)' }}
                        >
                            <Shield size={22} style={{ color: '#C67B2C' }} />
                        </div>
                        <div>
                            <p className='text-xs font-bold uppercase tracking-widest mb-1' style={{ color: '#C67B2C' }}>Legal</p>
                            <h1 className='text-2xl md:text-3xl font-extrabold text-white'>Privacy Policy</h1>
                        </div>
                    </div>
                    <p className='text-white/40 text-sm'>
                        Luminos Energy · Last updated: June 2025
                    </p>
                </div>
            </div>

            {/* ── Intro ── */}
            <div className='max-w-4xl mx-auto px-4 py-10'>
                <div
                    className='rounded-2xl p-6 mb-8 border'
                    style={{ background: 'white', borderColor: '#e5e0d8', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                    <p className='text-gray-600 text-sm leading-relaxed'>
                        At <strong className='text-gray-800'>Luminos Energy</strong>, your privacy matters. This policy explains what personal information
                        we collect, why we collect it, how it is protected, and what rights you have over your data.
                        By using the Luminos Energy platform, you agree to the practices described in this document.
                        If you do not agree, please discontinue use of the platform.
                    </p>
                </div>

                {/* ── Sections ── */}
                <div className='space-y-4'>
                    {SECTIONS.map((section, i) => (
                        <div
                            key={i}
                            className='rounded-2xl border overflow-hidden'
                            style={{ background: 'white', borderColor: '#e5e0d8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                        >
                            <div className='px-6 py-4 border-b' style={{ borderColor: '#f0ece6', background: '#faf8f5' }}>
                                <h2 className='text-gray-900 font-extrabold text-base'>{section.title}</h2>
                            </div>
                            <div className='px-6 py-5 space-y-5'>
                                {section.content.map((item, j) => (
                                    <div key={j}>
                                        <p className='text-sm font-bold text-gray-800 mb-1'>{item.subtitle}</p>
                                        <p className='text-sm text-gray-500 leading-relaxed'>{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Footer CTA ── */}
                <div className='mt-10 rounded-2xl p-6 text-center' style={{ background: 'linear-gradient(135deg,#1C1A18,#2D1F0E)' }}>
                    <p className='text-white/60 text-sm mb-4'>Ready to start investing with a platform that protects your data?</p>
                    <Link
                        to='/register'
                        className='inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm'
                        style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}
                    >
                        Create Free Account <ChevronRight size={15} />
                    </Link>
                </div>

                <p className='text-center text-gray-400 text-xs mt-6'>
                    © 2025 Luminos Energy. All rights reserved. ·{' '}
                    <Link to='/terms' className='hover:text-gray-600 transition-colors'>Terms of Service</Link>
                </p>
            </div>
        </div>
    )
}

export default Privacy