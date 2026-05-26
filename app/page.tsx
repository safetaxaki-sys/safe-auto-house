"use client";

import { ReactNode, useState } from "react";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type Tab =
  | "overview"
  | "daily"
  | "expenses"
  | "history"
  | "reports"
  | "updates"
  | "settings";

type VehicleType = "fuel" | "electric";

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
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedDay, setSelectedDay] = useState<DayKey>("mon");
  const [vehicleType, setVehicleType] = useState<VehicleType>("fuel");

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
    workingDaysPerWeek: 0,
  });

  const [updates, setUpdates] = useState<string[]>([]);
  const [newUpdate, setNewUpdate] = useState("");

  const day = days[selectedDay];

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

  const selectedCalc = calcDay(day);

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

  function addUpdate() {
    if (!newUpdate.trim()) return;
    setUpdates([newUpdate, ...updates]);
    setNewUpdate("");
  }

  return (
    <main className="min-h-screen bg-black text-white flex">
      <aside className="w-[280px] bg-[#050505] border-r border-orange-500/20 p-6 hidden lg:flex flex-col justify-between">
        <div>
          <div className="mb-12">
            <h1 className="text-6xl font-black italic leading-none">Safe</h1>
            <p className="text-orange-400 text-3xl italic font-bold">
              Auto-House
            </p>
          </div>

          <div className="space-y-3">
            <SidebarItem text="🏠 Επισκόπηση" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
            <SidebarItem text="💰 Ημερήσια Έσοδα" active={activeTab === "daily"} onClick={() => setActiveTab("daily")} />
            <SidebarItem text="📋 Έξοδα & Σταθερές" active={activeTab === "expenses"} onClick={() => setActiveTab("expenses")} />
            <SidebarItem text="🕓 Ιστορικό" active={activeTab === "history"} onClick={() => setActiveTab("history")} />
            <SidebarItem text="📊 Αναφορές" active={activeTab === "reports"} onClick={() => setActiveTab("reports")} />
            <SidebarItem text="📢 Ενημερώσεις" active={activeTab === "updates"} onClick={() => setActiveTab("updates")} />
            <SidebarItem text="⚙️ Ρυθμίσεις" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-4xl mx-auto">
            🚖
          </div>
          <p className="text-2xl font-bold mt-4">Οδηγός</p>
          <p className="text-zinc-400">Demo Driver</p>
        </div>
      </aside>

      <section className="flex-1 p-8 overflow-x-hidden">
        {activeTab === "overview" && (
          <>
            <Header title="Επισκόπηση" subtitle="Σύνολα όλων των ημερών της εβδομάδας" />

            <Stats
              totalIncome={weekTotals.income}
              totalExpenses={weekTotals.expenses}
              netIncome={weekTotals.net}
              label="Εβδομάδας"
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
              <Panel title="Ανάλυση Εσόδων Εβδομάδας">
                <PieChart
                  freenow={weekTotals.freenow}
                  bolt={weekTotals.bolt}
                  uber={weekTotals.uber}
                  street={weekTotals.street}
                />
              </Panel>

              <Panel title="Αναλυτικά Έξοδα Εβδομάδας">
                <Row label="Ενοίκιο" value={`- €${weekTotals.rent.toFixed(2)}`} />
                <Row label="Ένσημο" value={`- €${weekTotals.insurance.toFixed(2)}`} />
                <Row label={vehicleType === "electric" ? "Ηλεκτρικό κόστος" : "Καύσιμο οδηγού"} value={`- €${weekTotals.fuelOrElectric.toFixed(2)}`} />
                <Row label="Διόδια" value={`- €${weekTotals.tolls.toFixed(2)}`} />
                <Row label="ΦΠΑ από Ζ ταμειακής" value={`- €${weekTotals.vat.toFixed(2)}`} />
                <Row label="Φόρος εφαρμογών" value={`- €${weekTotals.appTax.toFixed(2)}`} />

                <div className="border-t border-zinc-700 pt-5 flex justify-between text-3xl font-black">
                  <span>Καθαρό εβδομάδας</span>
                  <span className="text-orange-400">€{weekTotals.net.toFixed(2)}</span>
                </div>
              </Panel>
            </div>

            <div className="mt-8">
              <DaySelector days={days} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
            </div>
          </>
        )}

        {activeTab === "daily" && (
          <>
            <Header title="Ημερήσια Έσοδα" subtitle="Πάτησε ημέρα και βάλε ποσά μόνο για αυτή τη βάρδια" />

            <DaySelector days={days} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

            <Panel title={`Καταχώρηση για ${day.label}`}>
              <Input label="FreeNow" value={day.freenow} onChange={(v) => updateDay("freenow", v)} />
              <Input label="Bolt" value={day.bolt} onChange={(v) => updateDay("bolt", v)} />
              <Input label="Uber" value={day.uber} onChange={(v) => updateDay("uber", v)} />
              <Input label="Δρόμος" value={day.street} onChange={(v) => updateDay("street", v)} />
              <Input label="Ζ Ταμειακής" value={day.zReport} onChange={(v) => updateDay("zReport", v)} />

              {vehicleType === "electric" ? (
                <Input label="Χλμ ηλεκτρικού" value={day.electricKm} onChange={(v) => updateDay("electricKm", v)} />
              ) : (
                <Input label="Καύσιμο ημέρας" value={day.fuelCost} onChange={(v) => updateDay("fuelCost", v)} />
              )}

              <button onClick={saveDay} className="w-full bg-orange-500 text-black font-bold text-xl rounded-2xl py-5 hover:bg-orange-400">
                Αποθήκευση {day.label}
              </button>

              <Panel title={`Σύνοψη ${day.label}`}>
                <Row label="Σύνολο εσόδων" value={`€${selectedCalc.totalIncome.toFixed(2)}`} />
                <Row label="Σύνολο εξόδων" value={`- €${selectedCalc.totalExpenses.toFixed(2)}`} />
                <Row label="Καθαρό ημέρας" value={`€${selectedCalc.netIncome.toFixed(2)}`} />
              </Panel>
            </Panel>
          </>
        )}
                {activeTab === "expenses" && (
          <>
            <Header title="Έξοδα & Σταθερές" subtitle="Ρυθμίσεις διαχειριστή ανά ημέρα" />

            <Panel title="Σταθερές διαχειριστή">
              <Input label="Ημερήσιο ενοίκιο" value={settings.rentPerDay} onChange={(v) => setSettings({ ...settings, rentPerDay: v })} />
              <Input label="Ημερήσιο ένσημο" value={settings.insurancePerDay} onChange={(v) => setSettings({ ...settings, insurancePerDay: v })} />
              <Input label="Ημερήσια διόδια" value={settings.tollsPerDay} onChange={(v) => setSettings({ ...settings, tollsPerDay: v })} />
              <Input label="ΦΠΑ %" value={settings.vatPercent} onChange={(v) => setSettings({ ...settings, vatPercent: v })} />
              <Input label="Φόρος εφαρμογών %" value={settings.appTaxPercent} onChange={(v) => setSettings({ ...settings, appTaxPercent: v })} />
              <Input label="Τιμή ανά χλμ ηλεκτρικού" value={settings.electricPricePerKm} onChange={(v) => setSettings({ ...settings, electricPricePerKm: v })} />
              <Input label="Μέρες εργασίας εβδομάδας" value={settings.workingDaysPerWeek} onChange={(v) => setSettings({ ...settings, workingDaysPerWeek: v })} />
            </Panel>

            <div className="mt-6">
              <Panel title="Τύπος οχήματος">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setVehicleType("fuel")}
                    className={`rounded-2xl p-5 text-xl font-bold border ${
                      vehicleType === "fuel"
                        ? "bg-orange-500 text-black border-orange-500"
                        : "bg-black border-zinc-800"
                    }`}
                  >
                    ⛽ Καύσιμο
                  </button>

                  <button
                    onClick={() => setVehicleType("electric")}
                    className={`rounded-2xl p-5 text-xl font-bold border ${
                      vehicleType === "electric"
                        ? "bg-orange-500 text-black border-orange-500"
                        : "bg-black border-zinc-800"
                    }`}
                  >
                    ⚡ Ηλεκτρικό
                  </button>
                </div>
              </Panel>
            </div>
          </>
        )}

        {activeTab === "history" && (
          <>
            <Header title="Ιστορικό" subtitle="Όλες οι ημέρες της εβδομάδας" />

            <div className="space-y-4">
              {Object.entries(days).map(([key, d]) => {
                const c = calcDay(d);

                return (
                  <div
                    key={key}
                    className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-2xl font-bold">{d.label}</p>
                      <p className="text-zinc-400">
                        {d.saved ? "✅ Αποθηκευμένη" : "🕓 Πρόχειρη"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-zinc-400">Έσοδα</p>
                      <p className="text-2xl font-bold">€{c.totalIncome.toFixed(2)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-zinc-400">Έξοδα</p>
                      <p className="text-2xl font-bold">€{c.totalExpenses.toFixed(2)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-zinc-400">Καθαρό</p>
                      <p className="text-2xl font-bold text-orange-400">€{c.netIncome.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "reports" && (
          <>
            <Header title="Αναφορές" subtitle="Συγκεντρωτικά εβδομάδας" />
            <Stats
              totalIncome={weekTotals.income}
              totalExpenses={weekTotals.expenses}
              netIncome={weekTotals.net}
              label="Εβδομάδας"
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
              <Panel title="Ανάλυση Εξόδων">
                <Row label="Ενοίκιο" value={`€${weekTotals.rent.toFixed(2)}`} />
                <Row label="Ένσημο" value={`€${weekTotals.insurance.toFixed(2)}`} />
                <Row label={vehicleType === "electric" ? "Ηλεκτρικό κόστος" : "Καύσιμο οδηγού"} value={`€${weekTotals.fuelOrElectric.toFixed(2)}`} />
                <Row label="Διόδια" value={`€${weekTotals.tolls.toFixed(2)}`} />
                <Row label="ΦΠΑ" value={`€${weekTotals.vat.toFixed(2)}`} />
                <Row label="Φόρος εφαρμογών" value={`€${weekTotals.appTax.toFixed(2)}`} />
              </Panel>

              <Panel title="Ανάλυση Εσόδων">
                <PieChart
                  freenow={weekTotals.freenow}
                  bolt={weekTotals.bolt}
                  uber={weekTotals.uber}
                  street={weekTotals.street}
                />
              </Panel>
            </div>
          </>
        )}

        {activeTab === "updates" && (
          <>
            <Header title="Ενημερώσεις" subtitle="Ανακοινώσεις διαχειριστή προς οδηγούς" />

            <Panel title="Νέα ενημέρωση">
              <textarea
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                placeholder="Γράψε ενημέρωση προς όλους τους οδηγούς..."
                className="w-full bg-black border border-zinc-800 focus:border-orange-500 rounded-2xl p-5 text-xl outline-none min-h-32"
              />

              <button
                onClick={addUpdate}
                className="w-full bg-orange-500 text-black font-bold text-xl rounded-2xl py-5"
              >
                Δημοσίευση
              </button>
            </Panel>

            <div className="space-y-4 mt-6">
              {updates.length === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-xl text-zinc-400">
                  Δεν υπάρχουν ενημερώσεις ακόμα.
                </div>
              )}

              {updates.map((update, index) => (
                <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-xl">
                  📢 {update}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "settings" && (
          <>
            <Header title="Ρυθμίσεις" subtitle="Βασικές ρυθμίσεις demo" />

            <Panel title="Στοιχεία">
              <Row label="Ρόλος" value="Demo Driver / Admin" />
              <Row label="Τύπος οχήματος" value={vehicleType === "electric" ? "Ηλεκτρικό" : "Καύσιμο"} />
              <Row label="Μέρες εργασίας" value={`${settings.workingDaysPerWeek}`} />
            </Panel>
          </>
        )}
      </section>
    </main>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-6xl font-black">{title}</h1>
      <p className="text-zinc-400 text-2xl mt-3">{subtitle}</p>
    </div>
  );
}

function SidebarItem({
  text,
  active,
  onClick,
}: {
  text: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 text-lg transition ${
        active
          ? "bg-orange-500 text-black font-bold"
          : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
      }`}
    >
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

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="text-zinc-400 text-lg mb-2">{label}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-black border border-zinc-800 focus:border-orange-500 rounded-2xl p-5 text-2xl outline-none"
      />
    </div>
  );
}

function Stats({
  totalIncome,
  totalExpenses,
  netIncome,
  label,
}: {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  label: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Stat title={`Συνολικά Έσοδα ${label}`} value={`€${totalIncome.toFixed(2)}`} />
      <Stat title={`Συνολικά Έξοδα ${label}`} value={`€${totalExpenses.toFixed(2)}`} />
      <Stat title={`Καθαρό Κέρδος ${label}`} value={`€${netIncome.toFixed(2)}`} orange />
    </div>
  );
}

function Stat({
  title,
  value,
  orange,
}: {
  title: string;
  value: string;
  orange?: boolean;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <p className="text-zinc-400 text-xl">{title}</p>
      <h2 className={`text-5xl font-black mt-5 ${orange ? "text-orange-400" : ""}`}>
        {value}
      </h2>
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

function DaySelector({ days, selectedDay, setSelectedDay }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
      {Object.entries(days).map(([key, day]: any) => (
        <button
          key={key}
          onClick={() => setSelectedDay(key)}
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

function PieChart({
  freenow,
  bolt,
  uber,
  street,
}: {
  freenow: number;
  bolt: number;
  uber: number;
  street: number;
}) {
  const total = freenow + bolt + uber + street;
  const freeNowPercent = total ? (freenow / total) * 100 : 0;
  const boltPercent = total ? (bolt / total) * 100 : 0;
  const uberPercent = total ? (uber / total) * 100 : 0;
  const streetPercent = total ? (street / total) * 100 : 0;

  return (
    <div className="space-y-4 text-xl">
      <Legend color="bg-red-500" label="FreeNow" value={`${freeNowPercent.toFixed(0)}%`} />
      <Legend color="bg-green-500" label="Bolt" value={`${boltPercent.toFixed(0)}%`} />
      <Legend color="bg-black border border-white" label="Uber" value={`${uberPercent.toFixed(0)}%`} />
      <Legend color="bg-white" label="Δρόμος" value={`${streetPercent.toFixed(0)}%`} />
    </div>
  );
}

function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-5 h-5 rounded-full ${color}`} />
      <span>{label}</span>
      <span className="ml-auto font-bold">{value}</span>
    </div>
  );
}