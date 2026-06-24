import { useState, useEffect } from "react";
import { useListSettings, useUpdateSettings } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Save, CheckCircle2, XCircle, Info, Send, Loader2 } from "lucide-react";

// ── Shared reusable field ─────────────────────────────────────────────────────
function TextField({
  label, hint, value, onChange, placeholder, type = "text",
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-stone-400 mb-1.5 leading-relaxed">{hint}</p>}
      <input
        type={type}
        className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A36253]/30 focus:border-[#A36253] transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ── SMTP secrets reference ────────────────────────────────────────────────────
const SMTP_SECRETS = [
  { name: "SMTP_HOST",  example: "smtp.gmail.com",  desc: "Your mail server hostname" },
  { name: "SMTP_PORT",  example: "587",              desc: "Usually 587 (TLS) or 465 (SSL)" },
  { name: "SMTP_USER",  example: "hello@ranaglow.ca", desc: "The sending email address / username" },
  { name: "SMTP_PASS",  example: "•••••••••",        desc: "App-specific password (never your real password)" },
  { name: "ADMIN_EMAIL", example: "admin@ranaglow.ca", desc: "Fallback recipient if the setting below is empty" },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function EmailSettingsTab() {
  const { data: rawSettings, refetch } = useListSettings();
  const settings = (rawSettings as Record<string, string> | undefined) ?? {};
  const updateMutation = useUpdateSettings({
    mutation: {
      onSuccess: () => { toast.success("Email settings saved"); refetch(); },
      onError: () => toast.error("Failed to save. Please try again."),
    },
  });

  const [local, setLocal] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<boolean | null>(null);

  // Test email state
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setLocal({ ...settings });
      // Pre-fill test email with configured admin email
      if (!testEmailTo && settings["email_admin_to"]) {
        setTestEmailTo(settings["email_admin_to"]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(settings)]);

  // Fetch SMTP status from backend
  useEffect(() => {
    fetch("/api/settings/email-status")
      .then((r) => r.json())
      .then((d: { configured: boolean }) => setSmtpStatus(d.configured))
      .catch(() => setSmtpStatus(false));
  }, []);

  const set = (key: string, value: string) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    updateMutation.mutate({ data: local });
    setDirty(false);
  };

  const handleSendTest = async () => {
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/send-test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmailTo || undefined }),
      });
      const data = (await res.json()) as { success?: boolean; to?: string; error?: string };
      if (res.ok && data.success) {
        setTestResult({ ok: true, msg: `Test email delivered to ${data.to}` });
        toast.success(`Test email sent to ${data.to}`);
      } else {
        setTestResult({ ok: false, msg: data.error ?? "Unknown error" });
        toast.error(data.error ?? "Failed to send test email");
      }
    } catch {
      setTestResult({ ok: false, msg: "Network error — server may be restarting" });
      toast.error("Could not reach server");
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-light text-stone-800">Email Settings</h2>
          <p className="text-stone-500 text-sm mt-0.5">Control who receives notifications and how emails are worded</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || updateMutation.isPending}
          className="flex items-center gap-2 bg-[#A36253] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#8a5244] transition disabled:opacity-50"
        >
          <Save size={15} /> {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {dirty && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-6">
          You have unsaved changes — click "Save Changes" to apply them.
        </div>
      )}

      <div className="space-y-6">

        {/* ── SMTP Status ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-5">
            {smtpStatus === null ? (
              <div className="w-4 h-4 mt-0.5 rounded-full border-2 border-stone-300 border-t-transparent animate-spin flex-shrink-0" />
            ) : smtpStatus ? (
              <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <h3 className="text-base font-semibold text-stone-800">SMTP Status</h3>
              <p className={`text-sm mt-0.5 ${smtpStatus ? "text-emerald-600" : "text-red-500"}`}>
                {smtpStatus === null
                  ? "Checking…"
                  : smtpStatus
                  ? "Connected — emails will be sent."
                  : "Not configured — emails are disabled until you add the secrets below."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 mb-3">
            <Info size={14} className="text-stone-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-stone-500 leading-relaxed">
              Add these as <strong>Secrets</strong> in your Replit project (Tools → Secrets). Never paste them in code.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-100">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Secret Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Example Value</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {SMTP_SECRETS.map(({ name, example, desc }) => (
                  <tr key={name} className="hover:bg-stone-50 transition">
                    <td className="px-4 py-3 font-mono text-[#A36253] font-semibold text-xs">{name}</td>
                    <td className="px-4 py-3 font-mono text-stone-500 text-xs">{example}</td>
                    <td className="px-4 py-3 text-stone-600 text-xs">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-stone-400">
            <strong>Gmail tip:</strong> Use an App Password (not your account password). Generate one at{" "}
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-[#A36253] underline underline-offset-2">
              myaccount.google.com/apppasswords
            </a>. Use <code className="bg-stone-100 px-1 rounded">smtp.gmail.com</code> as host and port <code className="bg-stone-100 px-1 rounded">587</code>.
          </p>
        </div>

        {/* ── Send Test Email ───────────────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-stone-800">Send Test Email</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Verify your SMTP setup by sending a test email right now. Leave the field blank to use the configured admin email.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="email"
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A36253]/30 focus:border-[#A36253] transition"
              placeholder={local["email_admin_to"] || "your@email.com"}
              value={testEmailTo}
              onChange={(e) => { setTestEmailTo(e.target.value); setTestResult(null); }}
              disabled={testSending}
            />
            <button
              onClick={handleSendTest}
              disabled={testSending || smtpStatus === false}
              className="flex items-center gap-2 bg-stone-800 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-stone-700 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {testSending ? (
                <><Loader2 size={15} className="animate-spin" /> Sending…</>
              ) : (
                <><Send size={15} /> Send Test</>
              )}
            </button>
          </div>

          {testResult && (
            <div className={`mt-3 flex items-start gap-2 text-sm px-4 py-3 rounded-lg ${
              testResult.ok
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}>
              {testResult.ok
                ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                : <XCircle size={16} className="mt-0.5 flex-shrink-0" />}
              <span>{testResult.msg}</span>
            </div>
          )}

          {smtpStatus === false && (
            <p className="mt-3 text-xs text-red-400">
              SMTP is not configured — add your secrets first, then restart the server.
            </p>
          )}
        </div>

        {/* ── Admin Notifications ───────────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-stone-800">Admin Notifications</h3>
            <p className="text-xs text-stone-400 mt-0.5">Sent to you whenever a client books a new appointment.</p>
          </div>
          <div className="space-y-5">
            <TextField
              label="Admin Notification Email"
              hint="The email address that receives booking alerts. Overrides the ADMIN_EMAIL secret."
              value={local["email_admin_to"] ?? ""}
              onChange={(v) => set("email_admin_to", v)}
              placeholder="admin@ranaglow.ca"
              type="email"
            />
            <TextField
              label="Admin Email Subject Line"
              hint="Subject for the notification you receive. Leave blank for the auto-generated default (includes service name, date, and time)."
              value={local["email_admin_subject"] ?? ""}
              onChange={(v) => set("email_admin_subject", v)}
              placeholder="New Appointment: {service} — {date} at {time}  (auto-generated if blank)"
            />
          </div>
        </div>

        {/* ── Client Confirmations ──────────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-stone-800">Client Confirmations</h3>
            <p className="text-xs text-stone-400 mt-0.5">Sent to clients immediately after their booking is submitted.</p>
          </div>
          <div className="space-y-5">
            <TextField
              label="Client Email Subject Line"
              hint="Subject line shown in the client's inbox. Leave blank for the auto-generated default (includes service name and date)."
              value={local["email_client_subject"] ?? ""}
              onChange={(v) => set("email_client_subject", v)}
              placeholder="Your Appointment is Confirmed — {service} on {date}  (auto-generated if blank)"
            />
          </div>
        </div>

        {/* ── Clinic Contact in Emails ──────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-stone-800">Clinic Contact in Emails</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              These appear as the call, WhatsApp, and email buttons at the bottom of each client confirmation.
            </p>
          </div>
          <div className="space-y-5">
            <TextField
              label="Phone Number"
              hint="Displayed and linked in the Call button."
              value={local["email_clinic_phone"] ?? ""}
              onChange={(v) => set("email_clinic_phone", v)}
              placeholder="055 5198 110"
              type="tel"
            />
            <TextField
              label="WhatsApp Number"
              hint="Full digits with country code (no spaces/dashes). Used to build the wa.me link."
              value={local["email_clinic_whatsapp"] ?? ""}
              onChange={(v) => set("email_clinic_whatsapp", v)}
              placeholder="97155519810"
            />
            <TextField
              label="Clinic Email Address"
              hint="Shown as the Email button. Clients can reply to this address."
              value={local["email_clinic_email"] ?? ""}
              onChange={(v) => set("email_clinic_email", v)}
              placeholder="hello@ranaglow.ca"
              type="email"
            />
            <TextField
              label="Studio Address"
              hint="Appears in the email footer."
              value={local["email_clinic_address"] ?? ""}
              onChange={(v) => set("email_clinic_address", v)}
              placeholder="123 Elgin St, Ottawa, ON K2P 1L4"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
