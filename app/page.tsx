"use client";

import { useState, type ReactNode } from "react";

type Role = "driver" | "admin";
type VehicleType = "fuel" | "electric";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

type DayData = {
  label: string;
  short: string;
  freenow: number;
  bolt: number;
  uber: number;
  street: number;
  zReport: number;
  fuelCost: number;
  electricKm: number;
  saved: boolean;
};

const emptyDay = (label: string, short: string): DayData => ({
  label,
  short,
  freenow: 0,
  bolt: 0,
  uber: 0,
  street: 0,
  zReport: 0,
  fuelCost: 0,
  electricKm: 0,
  saved: false,
});

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [driverTab, setDriverTab] = useState("home");
  const [adminTab, setAdminTab] = useState("drivers");
  const [selectedDay, setSelectedDay] = useState<DayKey>("mon");

  const [selectedHistoryMonth, setSelectedHistoryMonth] =
  useState(3);

  const [selectedHistoryWeek, setSelectedHistoryWeek] =
  useState<number | null>(null);

  const [vehicleType, setVehicleType] = useState<VehicleType>("fuel");

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    age: 0,
    phone: "",
    email: "",
    plate: "",

    identityNumber: "",
licenseNumber: "",
specialLicense: "",
taxNumber: "",

    freeNowEmail: "",
    freeNowPassword: "",
    boltEmail: "",
    boltPassword: "",
    uberEmail: "",
    uberPassword: "",
  });

  const [days, setDays] = useState<Record<DayKey, DayData>>({
    mon: emptyDay("Δευτέρα", "Δευ"),
    tue: emptyDay("Τρίτη", "Τρι"),
    wed: emptyDay("Τετάρτη", "Τετ"),
    thu: emptyDay("Πέμπτη", "Πεμ"),
    fri: emptyDay("Παρασκευή", "Παρ"),
    sat: emptyDay("Σάββατο", "Σαβ"),
    sun: emptyDay("Κυριακή", "Κυρ"),
  });

  const [settings, setSettings] = useState({
    rentPerDay: 0,
    insurancePerDay: 0,
    tollsPerDay: 0,
    vatPercent: 24,
    appTaxPercent: 0,
    electricPricePerKm: 0,
  });

  const [updates, setUpdates] = useState<string[]>([
    "Καλωσήρθες στο Safe Auto-House portal.",
  ]);
  const [newUpdate, setNewUpdate] = useState("");

  const selected = days[selectedDay];

  function calcDay(d: DayData) {
    const appIncome = d.freenow + d.bolt + d.uber;
    const totalIncome = appIncome + d.street;
    const vatAmount = (d.zReport * settings.vatPercent) / 100;
    const appTaxAmount = (appIncome * settings.appTaxPercent) / 100;
    const fuelOrElectric =
      vehicleType === "electric"
        ? d.electricKm * settings.electricPricePerKm
        : d.fuelCost;

    const totalExpenses =
      settings.rentPerDay +
      settings.insurancePerDay +
      settings.tollsPerDay +
      vatAmount +
      appTaxAmount +
      fuelOrElectric;

    return {
      appIncome,
      totalIncome,
      vatAmount,
      appTaxAmount,
      fuelOrElectric,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
    };
  }

  const selectedCalc = calcDay(selected);
  const historyMonths = buildHistoryMonths();

const activeMonth =
  historyMonths[selectedHistoryMonth];

const activeWeek =
  selectedHistoryWeek !== null
    ? activeMonth.weeks[selectedHistoryWeek]
    : null;

  const weekTotals = Object.values(days).reduce(
    (acc, d) => {
      const c = calcDay(d);

      acc.income += c.totalIncome;
      acc.expenses += c.totalExpenses;
      acc.net += c.netIncome;
      acc.rent += settings.rentPerDay;
      acc.insurance += settings.insurancePerDay;
      acc.tolls += settings.tollsPerDay;
      acc.vat += c.vatAmount;
      acc.appTax += c.appTaxAmount;
      acc.fuelOrElectric += c.fuelOrElectric;
      acc.freenow += d.freenow;
      acc.bolt += d.bolt;
      acc.uber += d.uber;
      acc.street += d.street;

      if (d.saved) acc.workedDays += 1;

      return acc;
    },
    {
      income: 0,
      expenses: 0,
      net: 0,
      rent: 0,
      insurance: 0,
      tolls: 0,
      vat: 0,
      appTax: 0,
      fuelOrElectric: 0,
      freenow: 0,
      bolt: 0,
      uber: 0,
      street: 0,
      workedDays: 0,
    }
  );

  function updateDay(field: keyof DayData, value: number | boolean) {
    setDays({
      ...days,
      [selectedDay]: {
        ...days[selectedDay],
        [field]: value,
      },
    });
  }

  function saveDay() {
    updateDay("saved", true);
  }

  function publishUpdate() {
    if (!newUpdate.trim()) return;
    setUpdates([newUpdate, ...updates]);
    setNewUpdate("");
  }
if (role === null) {
  return (
    <main
      className="min-h-screen bg-black text-white flex items-center justify-center bg-cover bg-center p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.9)), url('/login-bg.png')",
      }}
    >
      <div className="w-full max-w-7xl min-h-[90vh] rounded-[2rem] border border-white/10 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center px-8 py-12 shadow-2xl">

        <img
          src="/logo.png"
          alt="Safe Auto-House"
          className="w-72 mb-10 drop-shadow-2xl"
        />

        <div className="w-24 h-1 bg-orange-500 rounded-full mb-10" />

        <h1 className="text-5xl md:text-6xl font-black mb-4 text-center">
          Επιλέξτε είσοδο
        </h1>

        <p className="text-zinc-300 text-xl md:text-2xl mb-14 text-center">
          Συνδεθείτε στο κατάλληλο portal για να συνεχίσετε
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">

          <button
            onClick={() => setRole("driver")}
            className="group bg-black/70 border border-orange-500 rounded-[2rem] p-10 min-h-[800px] hover:scale-[1.03] transition shadow-[0_0_40px_rgba(249,115,22,0.25)]"
          >
            <div className="w-32 h-32 mx-auto rounded-full border border-orange-500 flex items-center justify-center text-7xl text-orange-500 mb-8">
              🛞
            </div>

            <h2 className="text-4xl font-black mb-6">
              Είσοδος Οδηγού
            </h2>

            <p className="text-zinc-300 text-xl leading-relaxed mb-10">
              Δείτε τα εισοδήματά σας, τα οχήματα και το ιστορικό σας.
            </p>

            <div className="bg-orange-500 text-black rounded-2xl py-5 text-2xl font-black group-hover:bg-orange-400 transition">
              Είσοδος →
            </div>
          </button>

          <button
            onClick={() => setRole("admin")}
            className="group bg-black/70 border border-white/20 rounded-[2rem] p-10 min-h-[380px] hover:border-orange-500 hover:scale-[1.03] transition"
          >
            <div className="w-32 h-32 mx-auto rounded-full border border-white/20 flex items-center justify-center text-7xl text-zinc-300 mb-8">
              👤
            </div>

            <h2 className="text-4xl font-black mb-6">
              Είσοδος Διαχειριστή
            </h2>

            <p className="text-zinc-300 text-xl leading-relaxed mb-10">
              Διαχειριστείτε οδηγούς, οχήματα και δεδομένα.
            </p>

            <div className="bg-zinc-900 border border-white/20 rounded-2xl py-5 text-2xl font-black group-hover:border-orange-500 transition">
              Είσοδος →
            </div>
          </button>

        </div>

        <div className="mt-14 border-t border-white/10 pt-8 text-zinc-400 text-xl">
          🔒 Ασφαλής πρόσβαση • Safe Auto-House Portal
        </div>
      </div>
    </main>
  );
}
  return (
    <main className="min-h-screen bg-black text-white flex">
      <aside className="w-[285px] bg-[#050505] border-r border-orange-500/20 p-6 hidden lg:flex flex-col justify-between">
        <div>
          <div className="mb-10">
            <button
  onClick={() => setDriverTab("home")}
  className="mb-5 text-left"
>
  <h1 className="text-7xl font-black italic leading-none">
    Safe
  </h1>

  <p className="text-orange-400 text-4xl italic font-bold">
    Auto-House
  </p>
</button>
            
          </div>

<div className="mb-10">
  <button
    onClick={() => setRole("driver")}
    className="w-full text-left rounded-2xl py-4 px-4 text-lg bg-orange-500 text-black font-bold"
  >
    👨‍✈️Οδηγός
  </button>
</div>

          {role === "driver" ? (
            <div className="space-y-3">
              <SidebarItem
  text="🏢 Αρχική"
  active={driverTab === "home"}
  onClick={() => setDriverTab("home")}
/>
              <SidebarItem text="🏠 Επισκόπηση" active={driverTab === "overview"} onClick={() => setDriverTab("overview")} />
              <SidebarItem text="💰 Ημερήσια Έσοδα" active={driverTab === "daily"} onClick={() => setDriverTab("daily")} />
              <SidebarItem text="📋 Έξοδα" active={driverTab === "expenses"} onClick={() => setDriverTab("expenses")} />
              <SidebarItem text="🕓 Ιστορικό" active={driverTab === "history"} onClick={() => setDriverTab("history")} />
              <SidebarItem text="📢 Ενημερώσεις" active={driverTab === "updates"} onClick={() => setDriverTab("updates")} />
                 <button
  onClick={() => setRole(null)}
  className="w-full mb-3 bg-black border border-orange-500 text-orange-400 rounded-2xl p-4 font-bold hover:bg-orange-500 hover:text-black transition"
>
  Αποσύνδεση
</button>
              
            </div>
          ) : (
            <div className="space-y-3">
              <SidebarItem text="👥 Οδηγοί" active={adminTab === "drivers"} onClick={() => setAdminTab("drivers")} />
              <SidebarItem text="📋 Σταθερές" active={adminTab === "expenses"} onClick={() => setAdminTab("expenses")} />
              <SidebarItem text="📢 Ανακοινώσεις" active={adminTab === "updates"} onClick={() => setAdminTab("updates")} />
              <SidebarItem text="📊 Reports" active={adminTab === "reports"} onClick={() => setAdminTab("reports")} />

            </div>
          )}
        </div>
        <button
  onClick={() => {
    if (role === "driver") setDriverTab("settings");
  }}
  className="w-full mb-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-3xl p-5 text-center transition"
>

          <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-4xl mx-auto">
            🚖
          </div>
          <p className="text-2xl font-bold mt-4">
          {role === "driver" ? "Οδηγός" : "Διαχειριστής"}          </p>
          <p className="text-zinc-400">Demo Mode</p>
        </button>
      </aside>

      <section className="flex-1 p-8 overflow-x-hidden">
        {role === "driver" && driverTab === "home" && (
  <>
    <Header
      title="Αρχική"
      subtitle="Ενημερώσεις Safe Auto-House"
    />

    <div className="space-y-4">
      {updates.map((update, index) => (
        <div
          key={index}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-xl"
        >
          📢 {update}
        </div>
      ))}
    </div>
  </>
)}
        {role === "driver" && driverTab === "overview" && (
          <>
            <Header title="Επισκόπηση Οδηγού" subtitle="Συνολική εικόνα εβδομάδας" />
            <Stats totalIncome={weekTotals.income} totalExpenses={weekTotals.expenses} netIncome={weekTotals.net} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
              <Panel title="Αναλυτικά Έξοδα">
                <Row label="Ενοίκιο" value={`- €${weekTotals.rent.toFixed(2)}`} />
                <Row label="Ένσημο" value={`- €${weekTotals.insurance.toFixed(2)}`} />
                <Row
                  label={vehicleType === "electric" ? "Ηλεκτρικό κόστος" : "Καύσιμο"}
                  value={`- €${weekTotals.fuelOrElectric.toFixed(2)}`}
                />
                <Row label="Διόδια" value={`- €${weekTotals.tolls.toFixed(2)}`} />
                <Row label="ΦΠΑ από Ζ" value={`- €${weekTotals.vat.toFixed(2)}`} />
                <Row label="Φόρος εφαρμογών" value={`- €${weekTotals.appTax.toFixed(2)}`} />
                <div className="border-t border-zinc-700 pt-5 flex justify-between text-3xl font-black">
                  <span>Καθαρό</span>
                  <span className="text-orange-400">€{weekTotals.net.toFixed(2)}</span>
                </div>
              </Panel>

              <Panel title="Ποσοστά Εσόδων">
                <PieChart freenow={weekTotals.freenow} bolt={weekTotals.bolt} uber={weekTotals.uber} street={weekTotals.street} />
              </Panel>
            </div>
          </>
        )}

        {role === "driver" && driverTab === "daily" && (
          <>
            <Header title="Ημερήσια Έσοδα" subtitle="Πάτησε ημέρα και βάλε ποσά" />
            <DaySelector days={days} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

            <Panel title={`Καταχώρηση για ${selected.label}`}>
              <Input label="FreeNow" value={selected.freenow} onChange={(v) => updateDay("freenow", v)} />
              <Input label="Bolt" value={selected.bolt} onChange={(v) => updateDay("bolt", v)} />
              <Input label="Uber" value={selected.uber} onChange={(v) => updateDay("uber", v)} />
              <Input label="Δρόμος" value={selected.street} onChange={(v) => updateDay("street", v)} />
              <Input label="Ζ Ταμειακής" value={selected.zReport} onChange={(v) => updateDay("zReport", v)} />

              {vehicleType === "electric" ? (
                <Input label="Χλμ ηλεκτρικού" value={selected.electricKm} onChange={(v) => updateDay("electricKm", v)} />
              ) : (
                <Input label="Καύσιμο ημέρας" value={selected.fuelCost} onChange={(v) => updateDay("fuelCost", v)} />
              )}

              <button onClick={saveDay} className="w-full bg-orange-500 text-black font-bold text-xl rounded-2xl py-5 hover:bg-orange-400">
                Αποθήκευση {selected.label}
              </button>

              <Panel title={`Σύνοψη ${selected.label}`}>
                <Row label="Σύνολο εσόδων" value={`€${selectedCalc.totalIncome.toFixed(2)}`} />
                <Row label="Σύνολο εξόδων" value={`- €${selectedCalc.totalExpenses.toFixed(2)}`} />
                <Row label="Καθαρό ημέρας" value={`€${selectedCalc.netIncome.toFixed(2)}`} />
              </Panel>
            </Panel>
          </>
        )}

        {role === "driver" && driverTab === "expenses" && (
          <>
            <Header title="Έξοδα & Σταθερές" subtitle="Προβολή εξόδων διαχειριστή" />
            <Panel title="Ημερήσιες Σταθερές">
              <Row label="Ημερήσιο ενοίκιο" value={`€${settings.rentPerDay}`} />
              <Row label="Ημερήσιο ένσημο" value={`€${settings.insurancePerDay}`} />
              <Row label="Ημερήσια διόδια" value={`€${settings.tollsPerDay}`} />
              <Row label="ΦΠΑ %" value={`${settings.vatPercent}%`} />
              <Row label="Φόρος εφαρμογών %" value={`${settings.appTaxPercent}%`} />
              <Row label="Τιμή ανά χλμ ηλεκτρικού" value={`€${settings.electricPricePerKm}`} />
            </Panel>
          </>
        )}

        {role === "driver" && driverTab === "history" && (
  <>
    <Header title="Ιστορικό" subtitle="Μήνας → Εβδομάδα → Ημέρα" />

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Panel title="Μήνες">
        {historyMonths.map((month, index) => (
          <button
            key={month.name}
            onClick={() => {
              setSelectedHistoryMonth(index);
              setSelectedHistoryWeek(null);
            }}
            className={`w-full rounded-2xl p-5 flex justify-between ${
              selectedHistoryMonth === index
                ? "bg-orange-500 text-black"
                : "bg-black border border-zinc-800"
            }`}
          >
            <span className="text-xl font-bold">{month.name}</span>
            <span className={month.net >= 0 ? "text-green-400" : "text-red-400"}>
              {month.net >= 0 ? "+" : "-"}€{Math.abs(month.net)}
            </span>
          </button>
        ))}
      </Panel>

      <Panel title={`Εβδομάδες ${activeMonth.name}`}>
        {activeMonth.weeks.map((week, index) => (
          <button
            key={week.label}
            onClick={() => setSelectedHistoryWeek(index)}
            className={`w-full rounded-2xl p-5 flex justify-between ${
              selectedHistoryWeek === index
                ? "bg-orange-500 text-black"
                : "bg-black border border-zinc-800"
            }`}
          >
            <span className="text-xl font-bold">{week.label}</span>
            <span className={week.net >= 0 ? "text-green-400" : "text-red-400"}>
              {week.net >= 0 ? "+" : "-"}€{Math.abs(week.net)}
            </span>
          </button>
        ))}
      </Panel>

      <Panel title={activeWeek ? `Ημέρες ${activeWeek.label}` : "Ημέρες"}>
        {!activeWeek && (
          <p className="text-zinc-400 text-xl">
            Πάτησε εβδομάδα για να δεις ημέρες.
          </p>
        )}

        {activeWeek?.days.map((day) => (
          <div
            key={day.name}
            className={`rounded-2xl p-5 flex justify-between ${
              day.net >= 0
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-red-500/10 border border-red-500/30"
            }`}
          >
            <span className="text-xl font-bold">{day.name}</span>
            <span className={day.net >= 0 ? "text-green-400" : "text-red-400"}>
              {day.net >= 0 ? "+" : "-"}€{Math.abs(day.net)}
            </span>
          </div>
        ))}
      </Panel>
    </div>
  </>
)}
        
        
{role === "driver" && driverTab === "settings" && (
  <>
    <Header
      title="Ρυθμίσεις Οδηγού"
      subtitle="Προσωπικά στοιχεία, έγγραφα και εφαρμογές"
    />

    <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-start">
        <div className="w-full aspect-square rounded-3xl bg-black border-4 border-orange-500 flex items-center justify-center text-9xl overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.25)]">
          👤
        </div>

        <button className="mt-8 w-full bg-orange-500 text-black font-bold rounded-2xl py-4">
          Ανέβασμα Φωτογραφίας
        </button>

        <p className="text-zinc-400 mt-4 text-center">
          Οι συνολικές μέρες εργασίας ενημερώνονται αυτόματα.
        </p>
      </div>

      <div className="space-y-5">
        <ProfileAccordion
          title="1. Προσωπικά Στοιχεία"
          subtitle="Όνομα, επίθετο, ηλικία και μέρες εργασίας"
        >
          <InputText label="Όνομα" value={profile.firstName} onChange={(v) => setProfile({ ...profile, firstName: v })} />
          <InputText label="Επίθετο" value={profile.lastName} onChange={(v) => setProfile({ ...profile, lastName: v })} />
          <Input label="Ηλικία" value={profile.age} onChange={(v) => setProfile({ ...profile, age: v })} />
          <Row label="Συνολικές μέρες εργασίας" value={`${weekTotals.workedDays}`} />
          <SaveButton />
        </ProfileAccordion>

        <ProfileAccordion
          title="2. Έγγραφα Οδηγού"
          subtitle="ΑΤ, δίπλωμα, ειδική άδεια, ΑΦΜ"
        >
          <InputText label="ΑΤ" value={profile.identityNumber || ""} onChange={(v) => setProfile({ ...profile, identityNumber: v })} />
          <InputText label="Αριθμός Διπλώματος" value={profile.licenseNumber || ""} onChange={(v) => setProfile({ ...profile, licenseNumber: v })} />
          <InputText label="Ειδική Άδεια" value={profile.specialLicense || ""} onChange={(v) => setProfile({ ...profile, specialLicense: v })} />
          <InputText label="ΑΦΜ" value={profile.taxNumber || ""} onChange={(v) => setProfile({ ...profile, taxNumber: v })} />
          <SaveButton />
        </ProfileAccordion>

        <ProfileAccordion
          title="3. Κωδικοί Εφαρμογών"
          subtitle="FreeNow, Bolt, Uber"
        >
          <InputText label="FreeNow Email" value={profile.freeNowEmail || ""} onChange={(v) => setProfile({ ...profile, freeNowEmail: v })} />
          <InputText label="FreeNow Κωδικός" value={profile.freeNowPassword || ""} onChange={(v) => setProfile({ ...profile, freeNowPassword: v })} />
          <InputText label="Bolt Email" value={profile.boltEmail || ""} onChange={(v) => setProfile({ ...profile, boltEmail: v })} />
          <InputText label="Bolt Κωδικός" value={profile.boltPassword || ""} onChange={(v) => setProfile({ ...profile, boltPassword: v })} />
          <InputText label="Uber Email" value={profile.uberEmail || ""} onChange={(v) => setProfile({ ...profile, uberEmail: v })} />
          <InputText label="Uber Κωδικός" value={profile.uberPassword || ""} onChange={(v) => setProfile({ ...profile, uberPassword: v })} />
          <SaveButton />
        </ProfileAccordion>
      </div>
    </div>
  </>
)}

        {role === "admin" && adminTab === "drivers" && (
          <>
            <Header title="Οδηγοί" subtitle="Διαχείριση οδηγών" />
            <Panel title="Demo Driver">
              <Row label="Οδηγός" value={`${profile.firstName || "-"} ${profile.lastName || ""}`} />
              <Row label="Όχημα" value={vehicleType === "electric" ? "Ηλεκτρικό" : "Καύσιμο"} />
              <Row label="Ημέρες εργασίας" value={`${weekTotals.workedDays}`} />
              <Row label="Καθαρό εβδομάδας" value={`€${weekTotals.net.toFixed(2)}`} />
            </Panel>
          </>
        )}

        {role === "admin" && adminTab === "expenses" && (
          <>
            <Header title="Έξοδα & Σταθερές" subtitle="Ρυθμίσεις διαχειριστή" />
            <Panel title="Editable Σταθερές">
              <Input label="Ημερήσιο ενοίκιο" value={settings.rentPerDay} onChange={(v) => setSettings({ ...settings, rentPerDay: v })} />
              <Input label="Ημερήσιο ένσημο" value={settings.insurancePerDay} onChange={(v) => setSettings({ ...settings, insurancePerDay: v })} />
              <Input label="Ημερήσια διόδια" value={settings.tollsPerDay} onChange={(v) => setSettings({ ...settings, tollsPerDay: v })} />
              <Input label="ΦΠΑ %" value={settings.vatPercent} onChange={(v) => setSettings({ ...settings, vatPercent: v })} />
              <Input label="Φόρος εφαρμογών %" value={settings.appTaxPercent} onChange={(v) => setSettings({ ...settings, appTaxPercent: v })} />
              <Input label="Τιμή ανά χλμ" value={settings.electricPricePerKm} onChange={(v) => setSettings({ ...settings, electricPricePerKm: v })} />

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setVehicleType("fuel")} className={vehicleType === "fuel" ? activeButton : normalButton}>
                  ⛽ Καύσιμο
                </button>
                <button onClick={() => setVehicleType("electric")} className={vehicleType === "electric" ? activeButton : normalButton}>
                  ⚡ Ηλεκτρικό
                </button>
              </div>
            </Panel>
          </>
        )}

        {role === "admin" && adminTab === "updates" && (
          <>
            <Header title="Ενημερώσεις" subtitle="Ανακοινώσεις προς οδηγούς" />
            <Panel title="Δημοσίευση">
              <textarea
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                placeholder="Γράψε ανακοίνωση..."
                className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-xl min-h-32 outline-none"
              />
              <button onClick={publishUpdate} className="w-full bg-orange-500 text-black font-bold text-xl rounded-2xl py-5">
                Δημοσίευση
              </button>
            </Panel>
          </>
        )}

        {role === "admin" && adminTab === "reports" && (
          <>
            <Header title="Reports" subtitle="Συνολικά στοιχεία" />
            <Stats totalIncome={weekTotals.income} totalExpenses={weekTotals.expenses} netIncome={weekTotals.net} />
          </>
        )}
      </section>
    </main>
  );
}

const activeButton = "rounded-2xl p-4 font-bold bg-orange-500 text-black";
const normalButton = "rounded-2xl p-4 font-bold bg-black border border-zinc-800";

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-6xl font-black">{title}</h1>
      <p className="text-zinc-400 text-2xl mt-3">{subtitle}</p>
    </div>
  );
}

function SidebarItem({ text, active, onClick }: { text: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full text-left rounded-2xl p-4 text-lg transition ${active ? "bg-orange-500 text-black font-bold" : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"}`}>
      {text}
    </button>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
      <div className="border-b border-orange-500/20 p-6">
        <h2 className="text-4xl font-black text-orange-400">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <p className="text-zinc-400 text-lg mb-2">{label}</p>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full bg-black border border-zinc-800 focus:border-orange-500 rounded-2xl p-5 text-2xl outline-none" />
    </div>
  );
}

function InputText({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="text-zinc-400 text-lg mb-2">{label}</p>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-zinc-800 focus:border-orange-500 rounded-2xl p-5 text-2xl outline-none" />
    </div>
  );
}

function Stats({ totalIncome, totalExpenses, netIncome }: { totalIncome: number; totalExpenses: number; netIncome: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Stat title="Συνολικά Έσοδα" value={`€${totalIncome.toFixed(2)}`} />
      <Stat title="Συνολικά Έξοδα" value={`€${totalExpenses.toFixed(2)}`} />
      <Stat title="Καθαρό Κέρδος" value={`€${netIncome.toFixed(2)}`} orange />
    </div>
  );
}

function Stat({ title, value, orange }: { title: string; value: string; orange?: boolean }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <p className="text-zinc-400 text-xl">{title}</p>
      <h2 className={`text-5xl font-black mt-5 ${orange ? "text-orange-400" : ""}`}>{value}</h2>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-2xl py-3">
      <span className="text-zinc-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function DaySelector({
  days,
  selectedDay,
  setSelectedDay,
}: {
  days: Record<DayKey, DayData>;
  selectedDay: DayKey;
  setSelectedDay: (day: DayKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
      {Object.entries(days).map(([key, day]) => (
        <button
          key={key}
          onClick={() => setSelectedDay(key as DayKey)}
          className={`rounded-3xl p-5 border transition ${
            selectedDay === key
              ? "bg-orange-500 text-black border-orange-500"
              : "bg-zinc-900 border-zinc-800"
          }`}
        >
          <p className="font-bold text-xl">{day.short}</p>
          <p className="mt-5 text-sm">{day.saved ? "✅ Αποθηκευμένη" : "🕓 Πρόχειρη"}</p>
        </button>
      ))}
    </div>
  );
}

function PieChart({ freenow, bolt, uber, street }: { freenow: number; bolt: number; uber: number; street: number }) {
  const total = freenow + bolt + uber + street;
  const p = (v: number) => (total ? ((v / total) * 100).toFixed(0) : "0");

  return (
    <div className="space-y-4 text-xl">
      <Legend color="bg-red-500" label="FreeNow" value={`${p(freenow)}%`} />
      <Legend color="bg-green-500" label="Bolt" value={`${p(bolt)}%`} />
      <Legend color="bg-black border border-white" label="Uber" value={`${p(uber)}%`} />
      <Legend color="bg-white" label="Δρόμος" value={`${p(street)}%`} />
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-5 h-5 rounded-full ${color}`} />
      <span>{label}</span>
      <span className="ml-auto font-bold">{value}</span>
    </div>
  );
}
function buildHistoryMonths() {
  const monthNames = [
    "Ιανουάριος",
    "Φεβρουάριος",
    "Μάρτιος",
    "Απρίλιος",
    "Μάιος",
    "Ιούνιος",
    "Ιούλιος",
    "Αύγουστος",
    "Σεπτέμβριος",
    "Οκτώβριος",
    "Νοέμβριος",
    "Δεκέμβριος",
  ];

  const today = new Date();

  return Array.from({ length: 4 }).map((_, i) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - 3 + i,
      1
    );

    const name = monthNames[date.getMonth()];

    const weeks = [
      makeWeek("01–07", [80, 120, -30, 90, 60, 0, 0]),
      makeWeek("08–14", [100, -20, 140, 70, 30, 110, 0]),
      makeWeek("15–21", [-40, 90, 130, 50, 80, 0, 0]),
      makeWeek("22–31", [120, 160, -10, 70, 90, 40, 0]),
    ];

    const net = weeks.reduce((sum, week) => sum + week.net, 0);

    return {
      name,
      net,
      weeks,
    };
  });
}

function makeWeek(label: string, values: number[]) {
  const dayNames = [
    "Δευτέρα",
    "Τρίτη",
    "Τετάρτη",
    "Πέμπτη",
    "Παρασκευή",
    "Σάββατο",
    "Κυριακή",
  ];

  const days = values.map((net, index) => ({
    name: dayNames[index],
    net,
  }));

  return {
    label,
    net: days.reduce((sum, day) => sum + day.net, 0),
    days,
  };
}
function ProfileAccordion({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-6 flex justify-between items-center text-left hover:bg-zinc-800 transition"
      >
        <div>
          <h2 className="text-3xl font-black text-orange-400">{title}</h2>
          <p className="text-zinc-400 mt-2">{subtitle}</p>
        </div>

        <span className="text-4xl">{open ? "−" : "+"}</span>
      </button>

      {open && <div className="p-6 space-y-5 border-t border-zinc-800">{children}</div>}
    </div>
  );
}

function SaveButton() {
  const [saved, setSaved] = useState(false);

  return (
    <button
      onClick={() => setSaved(true)}
      className="w-full bg-orange-500 text-black rounded-2xl py-4 font-bold text-xl"
    >
      {saved ? "Αποθηκεύτηκε ✓ — Επεξεργασία" : "Αποθήκευση"}
    </button>
  );
}