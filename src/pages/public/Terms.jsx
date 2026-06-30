import { Link } from 'react-router-dom'
import { FileText, ArrowLeft, ChevronRight } from 'lucide-react'

const SECTIONS = [
    {
        title: '1. Acceptance of Terms',
        content: [
            {
                subtitle: 'Agreement',
                text: 'By accessing or using the Luminos Energy platform ("the Platform"), you confirm that you are at least 18 years of age, are a resident of Nigeria, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use the Platform.',
            },
            {
                subtitle: 'Modifications',
                text: 'Luminos Energy reserves the right to update these Terms at any time. Material changes will be communicated via the app or our official Telegram channel. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.',
            },
        ],
    },
    {
        title: '2. The Platform & Services',
        content: [
            {
                subtitle: 'What We Offer',
                text: 'Luminos Energy is a solar energy investment platform that allows registered users to purchase investment plans ("VIP Plans") backed by solar energy infrastructure. Active plans generate daily income credited to users\' platform wallets on weekdays (Monday to Friday).',
            },
            {
                subtitle: 'No Guarantee of Returns',
                text: 'While Luminos Energy makes every effort to maintain consistent daily income distributions, investment returns are not legally guaranteed. Past performance of any investment plan does not guarantee future results. You acknowledge that all investments carry risk.',
            },
            {
                subtitle: 'Platform Availability',
                text: 'We strive to maintain 24/7 platform availability but do not guarantee uninterrupted access. Scheduled maintenance, server issues, or circumstances beyond our control may cause temporary downtime. We will not be liable for losses arising from platform unavailability.',
            },
        ],
    },
    {
        title: '3. Account Registration & Security',
        content: [
            {
                subtitle: 'One Account Per User',
                text: 'Each user is permitted one account only. Creating multiple accounts to exploit bonuses, referral rewards, or investment plans is strictly prohibited and will result in permanent suspension of all associated accounts and forfeiture of any balances.',
            },
            {
                subtitle: 'Account Security',
                text: 'You are solely responsible for maintaining the confidentiality of your login password and withdrawal password. Do not share your credentials with anyone, including individuals claiming to be Luminos Energy staff. We will never ask for your password.',
            },
            {
                subtitle: 'Accurate Information',
                text: 'You agree to provide accurate and truthful information during registration and to keep your account details up to date. Providing false information, including a fraudulent bank account, may result in account suspension and loss of funds.',
            },
            {
                subtitle: 'Security Question',
                text: 'Your security question and answer are used for password recovery. You are responsible for remembering your security answer. Luminos Energy cannot recover accounts where the security answer is forgotten and no other verification is available.',
            },
        ],
    },
    {
        title: '4. Investment Plans',
        content: [
            {
                subtitle: 'Plan Activation',
                text: 'An investment plan becomes active immediately upon successful purchase. The plan cycle begins on the activation date and runs for the number of days specified in the plan details (the "cycle period").',
            },
            {
                subtitle: 'Daily Income Claiming',
                text: 'Daily income is queued in your Invest Log every weekday. You must manually claim your income before midnight of the following day. Unclaimed income is forfeited and will not be carried forward. This policy is clearly communicated at the time of investment and cannot be reversed.',
            },
            {
                subtitle: 'Plan Expiry',
                text: 'When a plan completes its full cycle, the plan expires. Your original investment capital is not returned at the end of the cycle — the investment plan is a yield-generating product, not a capital deposit. Please read plan details carefully before purchasing.',
            },
            {
                subtitle: 'Free VIP0 Plan',
                text: 'The free VIP0 plan is provided as an introductory product. It generates a small daily income with no upfront cost. Each user is eligible for one free plan only.',
            },
        ],
    },
    {
        title: '5. Deposits & Withdrawals',
        content: [
            {
                subtitle: 'Deposits',
                text: 'Wallet funding is done via bank transfer to our designated account. Deposits are credited to your platform wallet upon confirmation. Luminos Energy is not responsible for delays caused by your bank. Do not deposit from a third-party account — deposits must be made from a bank account in your own name.',
            },
            {
                subtitle: 'Minimum Withdrawal',
                text: 'A minimum withdrawal amount applies and is displayed within the app. Withdrawal requests below the minimum will be rejected.',
            },
            {
                subtitle: 'Processing Time',
                text: 'Withdrawal requests are processed within 5 minutes to 48 hours. Processing time may be longer during weekends, public holidays, or periods of high platform activity. We do not charge withdrawal fees.',
            },
            {
                subtitle: 'Bank Account Verification',
                text: 'Withdrawals are only sent to the bank account linked to your Luminos Energy profile. You must link a valid Nigerian bank account before requesting a withdrawal. We are not liable for funds sent to an incorrectly entered bank account number.',
            },
            {
                subtitle: 'Withdrawal Password',
                text: 'A separate withdrawal password is required to authorise withdrawal requests. This is distinct from your login password and adds an additional layer of security to your funds.',
            },
        ],
    },
    {
        title: '6. Referral Program',
        content: [
            {
                subtitle: 'How It Works',
                text: 'Registered users receive a unique referral code. When a new user signs up using your referral code and makes their first investment, you earn a referral commission as specified in the current commission schedule within the app.',
            },
            {
                subtitle: 'Multi-Tier Commissions',
                text: 'The Luminos Energy referral program may offer commissions across multiple tiers of referrals. Commission rates and tier structures are displayed in the Referral section of the app and are subject to change with notice.',
            },
            {
                subtitle: 'Referral Abuse',
                text: 'Referring yourself using alternate accounts, purchasing referrals, or any form of referral manipulation is strictly prohibited. Detected abuse will result in permanent account suspension and forfeiture of all referral earnings.',
            },
            {
                subtitle: 'Commission Payment',
                text: 'Referral commissions are credited to your platform wallet and may be withdrawn subject to the standard withdrawal terms. Commissions are only paid on legitimate referrals that meet the qualifying criteria.',
            },
        ],
    },
    {
        title: '7. Prohibited Activities',
        content: [
            {
                subtitle: 'You Must Not',
                text: 'Use the platform for money laundering, fraud, or any illegal activity. Attempt to hack, reverse-engineer, or disrupt the platform. Create multiple accounts or manipulate the referral or investment system. Impersonate Luminos Energy staff or other users. Use automated bots or scripts to interact with the platform.',
            },
            {
                subtitle: 'Consequences',
                text: 'Violation of any of the above will result in immediate and permanent account suspension. Any balance in a suspended account will be forfeited. Luminos Energy reserves the right to report illegal activity to relevant Nigerian authorities.',
            },
        ],
    },
    {
        title: '8. Limitation of Liability',
        content: [
            {
                subtitle: 'Platform Liability',
                text: 'To the maximum extent permitted by Nigerian law, Luminos Energy shall not be liable for any indirect, incidental, or consequential losses arising from your use of the platform, including but not limited to lost profits, missed income claims, or losses due to account compromise caused by your own negligence.',
            },
            {
                subtitle: 'Force Majeure',
                text: 'Luminos Energy is not liable for any failure to perform its obligations due to circumstances beyond its reasonable control, including natural disasters, government actions, internet or power outages, or third-party service failures.',
            },
        ],
    },
    {
        title: '9. Governing Law',
        content: [
            {
                subtitle: 'Jurisdiction',
                text: 'These Terms of Service are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms shall be subject to the jurisdiction of the courts of Nigeria.',
            },
        ],
    },
    {
        title: '10. Contact',
        content: [
            {
                subtitle: 'Reach Us',
                text: 'For questions about these Terms, account issues, or disputes, please contact our support team via Telegram at t.me/Luminosenergy or via WhatsApp. We aim to respond to all inquiries within 24–48 hours.',
            },
        ],
    },
]

const Terms = () => {
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
                            <FileText size={22} style={{ color: '#C67B2C' }} />
                        </div>
                        <div>
                            <p className='text-xs font-bold uppercase tracking-widest mb-1' style={{ color: '#C67B2C' }}>Legal</p>
                            <h1 className='text-2xl md:text-3xl font-extrabold text-white'>Terms of Service</h1>
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
                        These Terms of Service govern your use of the <strong className='text-gray-800'>Luminos Energy</strong> platform,
                        including the website at mylmenergy.com and any associated mobile or web applications.
                        Please read them carefully before creating an account or making any investment. These Terms
                        form a binding legal agreement between you and Luminos Energy.
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
                    <p className='text-white/60 text-sm mb-4'>By creating an account, you confirm you have read and agreed to these terms.</p>
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
                    <Link to='/privacy' className='hover:text-gray-600 transition-colors'>Privacy Policy</Link>
                </p>
            </div>
        </div>
    )
}

export default Terms