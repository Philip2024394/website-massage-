import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, DollarSign, Clock, Award, AlertTriangle } from 'lucide-react';
import { membershipService } from '../lib/appwriteService';
import './MembershipTermsPage.css';

interface MembershipTermsPageProps {
  memberType?: 'therapist' | 'massage_place' | 'facial_place';
}

const MembershipTermsPage: React.FC<MembershipTermsPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  
  // Get member info from state or URL params
  const searchParams = new URLSearchParams(location.search);
  const memberType = (location.state?.memberType || searchParams.get('type') || 'therapist') as 'therapist' | 'massage_place' | 'facial_place';
  const memberId = location.state?.memberId || searchParams.get('memberId');

  const memberTypeLabels = {
    therapist: 'Therapist / Terapis',
    massage_place: 'Massage Place / Tempat Pijat',
    facial_place: 'Facial Place / Tempat Facial'
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setScrolledToBottom(scrolledToBottom);
  };

  const handleAcceptAgreement = async () => {
    // Store terms acceptance in localStorage
    try {
      localStorage.setItem('membership_terms_accepted', 'true');
      localStorage.setItem('membership_terms_date', new Date().toISOString());
    } catch (err) {
      console.error('Failed to save terms acceptance:', err);
    }

    if (!memberId) {
      // No memberId - redirect to membership signup flow for portal selection
      const urlParams = new URLSearchParams(location.search);
      const plan = urlParams.get('plan') || localStorage.getItem('selected_membership_plan') || 'pro';
      navigate(`/membership-signup?plan=${plan}&step=portal`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get IP and user agent
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      await membershipService.acceptAgreement(memberId, memberType, {
        ipAddress: data.ip,
        userAgent: navigator.userAgent
      });

      // Redirect to portal selection in membership signup flow
      const urlParams = new URLSearchParams(location.search);
      const plan = urlParams.get('plan') || localStorage.getItem('selected_membership_plan') || 'pro';
      setTimeout(() => {
        navigate(`/membership-signup?plan=${plan}&step=portal`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to accept agreement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="membership-terms-page">
      <div className="membership-terms-container">
        {/* Header */}
        <div className="terms-header">
          <Shield className="header-icon" size={48} />
          <h1>Membership Agreement</h1>
          <h2>Perjanjian Keanggotaan</h2>
          <div className="country-badge">🇮🇩 Indonesia (IDR)</div>
          <p className="member-type-label">
            For: {memberTypeLabels[memberType]}
          </p>
        </div>

        {/* Terms Content */}
        <div className="terms-content" onScroll={handleScroll}>
          
          {/* Pricing Structure */}
          <section className="terms-section">
            <h3><DollarSign size={24} /> Pricing Structure / Struktur Harga</h3>
            
            <div className="pricing-tiers">
              <div className="pricing-tier trial">
                <div className="tier-badge">FREE</div>
                <div className="tier-label">Month 1 / Bulan 1</div>
                <div className="tier-price">Rp 0</div>
                <p className="tier-description">Free trial period / Masa percobaan gratis</p>
              </div>

              <div className="pricing-tier standard">
                <div className="tier-label">Month 2 / Bulan 2</div>
                <div className="tier-price">Rp 100,000</div>
              </div>

              <div className="pricing-tier standard">
                <div className="tier-label">Month 3 / Bulan 3</div>
                <div className="tier-price">Rp 135,000</div>
              </div>

              <div className="pricing-tier standard">
                <div className="tier-label">Month 4 / Bulan 4</div>
                <div className="tier-price">Rp 175,000</div>
              </div>

              <div className="pricing-tier ongoing">
                <div className="tier-label">Month 5+ / Bulan 5+</div>
                <div className="tier-price">Rp 200,000/month</div>
                <p className="tier-description">Continues at this rate for all future months / Berlanjut dengan tarif ini untuk semua bulan berikutnya</p>
              </div>

              <div className="pricing-tier premium">
                <div className="tier-badge">PREMIUM</div>
                <div className="tier-label">Upgrade from Leads</div>
                <div className="tier-price">Rp 275,000/month</div>
                <div className="tier-features">
                  <CheckCircle size={16} /> Verified Badge
                  <CheckCircle size={16} /> Unlimited Bookings
                  <CheckCircle size={16} /> No Lead Charges
                </div>
              </div>
            </div>
          </section>

          {/* Lead-Based Model */}
          <section className="terms-section">
            <h3><AlertTriangle size={24} /> Lead-Based Fallback / Sistem Per-Lead</h3>
            <div className="info-box warning">
              <h4>⚠️ AUTOMATIC SWITCH TO PAY-PER-BOOKING</h4>
              <p>
                <strong>If subscription not paid by the 10th of the month:</strong><br />
                Your account automatically switches to Lead-Based Model (no monthly fee).
              </p>
              <p>
                <strong>Jika berlangganan tidak dibayar pada tanggal 10:</strong><br />
                Akun Anda otomatis beralih ke Model Per-Lead (tanpa biaya bulanan).
              </p>
              
              <div className="payment-timeline">
                <div className="timeline-item">
                  <strong>Day 1-5:</strong> Grace period (no penalty)<br />
                  <em>Hari 1-5: Masa tenggang (tanpa denda)</em>
                </div>
                <div className="timeline-item">
                  <strong>Day 6-10:</strong> Rp 25,000 late fee applies<br />
                  <em>Hari 6-10: Denda Rp 25.000 diterapkan</em>
                </div>
                <div className="timeline-item alert">
                  <strong>After Day 10:</strong> Switch to lead-based (Rp 50k per booking only)<br />
                  <em>Setelah Hari 10: Beralih ke per-lead (Rp 50rb per booking saja)</em>
                </div>
              </div>
              
              <div className="lead-pricing">
                <DollarSign size={20} />
                <span>Rp 50,000 per accepted lead / per lead yang diterima</span>
              </div>
              <p className="small-text">
                <strong>No monthly subscription fee.</strong> You only pay when you accept a booking.<br />
                <em>Tanpa biaya berlangganan bulanan. Anda hanya membayar saat menerima booking.</em><br />
                You will receive WhatsApp notifications for each booking request.<br />
                Anda akan menerima notifikasi WhatsApp untuk setiap permintaan booking.
              </p>
            </div>
          </section>

          {/* Commitment Terms */}
          <section className="terms-section">
            <h3><Clock size={24} /> Commitment Terms / Syarat Komitmen</h3>
            
            <div className="info-box important">
              <h4>⚠️ BY ACCEPTING THE FREE MONTH 1 TRIAL, YOU AGREE TO:</h4>
              <h4>⚠️ DENGAN MENERIMA PERCOBAAN GRATIS BULAN 1, ANDA SETUJU UNTUK:</h4>
              
              <ul className="commitment-list">
                <li>
                  <CheckCircle size={18} />
                  <div>
                    <strong>5-Month Minimum Commitment</strong><br />
                    Pay monthly subscription fees through Month 5<br />
                    <em>Komitmen minimum 5 bulan - Bayar biaya berlangganan bulanan hingga Bulan 5</em>
                  </div>
                </li>
                <li>
                  <CheckCircle size={18} />
                  <div>
                    <strong>Payment Schedule</strong><br />
                    Due on 1st of each month, grace period until 5th<br />
                    <em>Jatuh tempo pada tanggal 1 setiap bulan, masa tenggang hingga tanggal 5</em>
                  </div>
                </li>
                <li>
                  <CheckCircle size={18} />
                  <div>
                    <strong>Late Fees</strong><br />
                    Rp 25,000 late fee applied after the 5th<br />
                    <em>Denda keterlambatan Rp 25.000 diterapkan setelah tanggal 5</em>
                  </div>
                </li>
                <li>
                  <CheckCircle size={18} />
                  <div>
                    <strong>Auto-Renewal at Fixed Rate</strong><br />
                    Month 5 onwards: Always Rp 200,000/month (no further increases)<br />
                    <em>Bulan 5 dan seterusnya: Selalu Rp 200.000/bulan (tidak ada kenaikan lagi)</em>
                  </div>
                </li>
                <li>
                  <CheckCircle size={18} />
                  <div>
                    <strong>Payment Deadline</strong><br />
                    Must pay by 10th of each month or switch to lead-based (Rp 50k/booking)<br />
                    <em>Harus bayar sebelum tanggal 10 atau beralih ke per-lead (Rp 50rb/booking)</em>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Verified Badge */}
          <section className="terms-section">
            <h3><Award size={24} /> Verified Badge / Lencana Terverifikasi</h3>
            
            <div className="badge-info">
              <div className="badge-display">
                <Shield size={32} className="verified-icon" />
                <span className="verified-text">VERIFIED</span>
              </div>
              
              <div className="badge-rules">
                <h4>✅ Badge Granted When / Lencana Diberikan Ketika:</h4>
                <ul>
                  <li>Active paid membership (Month 2+) / Keanggotaan berbayar aktif (Bulan 2+)</li>
                  <li>No outstanding dues / Tidak ada tunggakan</li>
                  <li>Premium membership active / Keanggotaan premium aktif</li>
                </ul>
                
                <h4>❌ Badge Removed When / Lencana Dihapus Ketika:</h4>
                <ul>
                  <li>Subscription not paid by 10th / Berlangganan tidak dibayar pada tanggal 10</li>
                  <li>Switched to lead-based model / Beralih ke model per-lead</li>
                  <li>Outstanding payments exist / Ada tunggakan pembayaran</li>
                  <li>Account deactivated / Akun dinonaktifkan</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Upgrade Policy */}
          <section className="terms-section">
            <h3><DollarSign size={24} /> Premium Upgrade Policy / Kebijakan Upgrade Premium</h3>
            
            <div className="info-box premium">
              <h4>📈 Upgrade from Lead-Based to Premium</h4>
              <h4>📈 Upgrade dari Per-Lead ke Premium</h4>
              
              <div className="upgrade-details">
                <div className="upgrade-cost">
                  <strong>Fixed Monthly Fee:</strong> Rp 275,000<br />
                  <em>Biaya Bulanan Tetap: Rp 275.000</em>
                </div>
                
                <div className="upgrade-requirements">
                  <h5>Requirements / Persyaratan:</h5>
                  <ul>
                    <li>✅ Currently on lead-based model / Saat ini menggunakan model per-lead</li>
                    <li>✅ All outstanding lead charges paid / Semua tagihan lead telah dibayar</li>
                    <li>✅ Pay current month + next month upfront / Bayar bulan ini + bulan depan di muka</li>
                  </ul>
                </div>
                
                <div className="upgrade-benefits">
                  <h5>Premium Benefits / Keuntungan Premium:</h5>
                  <ul>
                    <li>🏅 Verified badge immediately / Lencana terverifikasi segera</li>
                    <li>📞 Unlimited booking requests / Permintaan booking tak terbatas</li>
                    <li>💰 No per-lead charges (Rp 50k) / Tidak ada biaya per-lead (Rp 50rb)</li>
                    <li>⭐ Priority customer support / Dukungan pelanggan prioritas</li>
                    <li>📈 Enhanced profile visibility / Visibilitas profil ditingkatkan</li>
                  </ul>
                </div>
                
                <div className="upgrade-note">
                  <AlertTriangle size={18} />
                  <p>
                    <strong>Note:</strong> Upgrade is permanent. Cannot downgrade back to lead-based model.<br />
                    <em>Catatan: Upgrade bersifat permanen. Tidak dapat downgrade kembali ke model per-lead.</em>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Deactivation Policy */}
          <section className="terms-section">
            <h3><XCircle size={24} /> Deactivation Policy / Kebijakan Penonaktifan</h3>
            
            <div className="info-box danger">
              <h4>🚫 Account Deactivation Requirements</h4>
              <h4>🚫 Persyaratan Penonaktifan Akun</h4>
              
              <div className="deactivation-rules">
                <div className="rule-item">
                  <AlertTriangle size={20} />
                  <div>
                    <strong>All Dues Must Be Paid in Advance</strong><br />
                    Pay all outstanding membership fees AND lead charges<br />
                    <em>Semua tunggakan harus dibayar di muka - Bayar semua biaya keanggotaan DAN tagihan lead</em>
                  </div>
                </div>
                
                <div className="rule-item">
                  <Clock size={20} />
                  <div>
                    <strong>30-Day Notice Period</strong><br />
                    Deactivation effective 30 days after request<br />
                    <em>Periode pemberitahuan 30 hari - Penonaktifan efektif 30 hari setelah permintaan</em>
                  </div>
                </div>
                
                <div className="rule-item">
                  <XCircle size={20} />
                  <div>
                    <strong>Verified Badge Removed</strong><br />
                    Lose all premium benefits and verified status<br />
                    <em>Lencana terverifikasi dihapus - Kehilangan semua manfaat premium dan status terverifikasi</em>
                  </div>
                </div>
                
                <div className="rule-item">
                  <Clock size={20} />
                  <div>
                    <strong>90-Day Reactivation Lock</strong><br />
                    Cannot reactivate account for 90 days<br />
                    <em>Kunci reaktivasi 90 hari - Tidak dapat mengaktifkan kembali akun selama 90 hari</em>
                  </div>
                </div>
                
                <div className="rule-item">
                  <DollarSign size={20} />
                  <div>
                    <strong>Reactivation Fee: Rp 275,000</strong><br />
                    Premium pricing only + admin approval required<br />
                    <em>Biaya reaktivasi: Rp 275.000 - Hanya harga premium + perlu persetujuan admin</em>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Reminders */}
          <section className="terms-section">
            <h3><Clock size={24} /> Automated Payment Reminders / Pengingat Pembayaran Otomatis</h3>
            
            <div className="info-box info">
              <p>
                <strong>We will automatically send payment reminders via WhatsApp:</strong><br />
                <em>Kami akan mengirimkan pengingat pembayaran otomatis melalui WhatsApp:</em>
              </p>
              
              <ul className="reminder-schedule">
                <li>📅 7 days before due date / 7 hari sebelum jatuh tempo</li>
                <li>📅 3 days before due date / 3 hari sebelum jatuh tempo</li>
                <li>📅 1 day before due date / 1 hari sebelum jatuh tempo</li>
                <li>📅 On due date (1st) / Pada tanggal jatuh tempo (tanggal 1)</li>
                <li>⚠️ 1 day after due date / 1 hari setelah jatuh tempo</li>
              </ul>
              
              <p className="small-text">
                Each reminder includes a Stripe payment link for easy payment.<br />
                <em>Setiap pengingat mencakup link pembayaran Stripe untuk kemudahan pembayaran.</em>
              </p>
            </div>
          </section>

          {/* Legal Agreement */}
          <section className="terms-section legal">
            <h3>📜 Legal Agreement / Perjanjian Hukum</h3>
            
            <div className="legal-text">
              <p>
                By clicking "I Accept and Agree" below, you acknowledge that you have read, understood, 
                and agree to be bound by all terms and conditions outlined in this Membership Agreement.
              </p>
              <p>
                <em>
                  Dengan mengklik "Saya Menerima dan Setuju" di bawah, Anda mengakui bahwa Anda telah membaca, 
                  memahami, dan setuju untuk terikat oleh semua syarat dan ketentuan yang diuraikan dalam 
                  Perjanjian Keanggotaan ini.
                </em>
              </p>
              
              <p className="legal-binding">
                <strong>This agreement is legally binding once live.</strong><br />
                <em>Perjanjian ini mengikat secara hukum setelah aktif.</em>
              </p>
              
              <div className="agreement-version">
                Agreement Version: 1.0<br />
                Date: December 10, 2025<br />
                <em>Versi Perjanjian: 1.0<br />
                Tanggal: 10 Desember 2025</em>
              </div>
            </div>
          </section>

        </div>

        {/* Scroll Indicator */}
        {!scrolledToBottom && (
          <div className="scroll-indicator">
            <p>↓ Please scroll to read all terms / Silakan gulir untuk membaca semua syarat ↓</p>
          </div>
        )}

        {/* Agreement Checkbox */}
        <div className="agreement-checkbox">
          <label>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={!scrolledToBottom}
            />
            <span>
              I have read and agree to all terms and conditions<br />
              <em>Saya telah membaca dan menyetujui semua syarat dan ketentuan</em>
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="terms-actions">
          <button
            className="btn-decline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            <XCircle size={20} />
            Decline / Tolak
          </button>
          
          <button
            className="btn-accept"
            onClick={handleAcceptAgreement}
            disabled={!accepted || !scrolledToBottom || loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                I Accept and Agree / Saya Menerima dan Setuju
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <div className="terms-footer">
          <p className="small-text">
            Questions? Contact our support team / Ada pertanyaan? Hubungi tim dukungan kami<br />
            Email: support@yourdomain.com | WhatsApp: +62 xxx-xxxx-xxxx
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipTermsPage;
