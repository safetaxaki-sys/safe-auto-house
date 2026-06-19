"use client";

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import * as XLSX from "xlsx";

import { isSupabaseConfigured, supabase } from "./lib/supabase";

type Role = "driver" | "admin";
type VehicleType = "fuel" | "electric";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type DriverStatus = "active" | "frozen" | "fired";

type AuthAccount = {
  email: string;
  password: string;
  role: Role;
  driverId?: string;
  label: string;
  taxNumber?: string;
};

type LoginMode = "choice" | "driver" | "admin" | "register";

type RegistrationRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  adminEmail: string;
  adminTaxNumber: string;
  createdAt: string;
};

type WeeklyAppRevenue = {
  freenow: number;
  bolt: number;
  uber: number;
  savedAt?: string;
};

type WeeklyTurnoverRecord = {
  weekKey: string;
  rent: number;
  vat: number;
  appTax: number;
  total: number;
  workedDays: number;
  savedAt: string;
};

type SalesInstallment = {
  id: string;
  plate: string;
  price: number;
  vehicleType: string;
  totalPrice: number;
  monthlyPrice: number;
  totalInstallments: number;
  paidInstallments: number;
  lastPaidMonth: string;
  taxiLicenseMonthlyInstallment: number;
  ownerName: string;
  carModel: string;
};

type OfficialDriverWeek = {
  appTurnover: number;
  cardPayments: number;
  freenowCard: number;
  freenowCash: number;
  uberCard: number;
  uberCash: number;
  boltCard: number;
  boltCash: number;
  workedDays: number;
  vat: number;
};

type AnnouncementPost = {
  id: string;
  message: string;
  imageUrl?: string;
  createdAt: string;
};

type ExpenseSettings = {
  rentPerDay: number;
  insurancePerDay: number;
  tollsPerDay: number;
  vatPercent: number;
  appTaxPercent: number;
  electricPricePerKm: number;
};

type DayData = {
  label: string;
  short: string;
  date: string;
  dateKey: string;
  freenow: number;
  bolt: number;
  uber: number;
  street: number;
  zReport: number;
  fuelCost: number;
  electricKm: number;
  saved: boolean;
};

const emptyDay = (label: string, short: string, date: Date): DayData => ({
  label,
  short,
  date: formatShortDate(date),
  dateKey: getDateKey(date),
  freenow: 0,
  bolt: 0,
  uber: 0,
  street: 0,
  zReport: 0,
  fuelCost: 0,
  electricKm: 0,
  saved: false,
});

const activeButton = "rounded-xl px-4 py-3 text-base font-bold bg-[#E8B858] text-black";
const normalButton =
  "rounded-xl px-4 py-3 text-base font-bold bg-black border border-zinc-800";
const dayKeys: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const greekWeekDays: Record<DayKey, { label: string; short: string }> = {
  mon: { label: "Δευτέρα", short: "Δευ" },
  tue: { label: "Τρίτη", short: "Τρι" },
  wed: { label: "Τετάρτη", short: "Τετ" },
  thu: { label: "Πέμπτη", short: "Πεμ" },
  fri: { label: "Παρασκευή", short: "Παρ" },
  sat: { label: "Σάββατο", short: "Σαβ" },
  sun: { label: "Κυριακή", short: "Κυρ" },
};
const weekStorageKey = "safe-auto-house-weeks";
const profitStorageKey = "safe-auto-house-weekly-app-profits";
const officialDriverWeeksStorageKey = "safe-auto-house-official-driver-weeks";
const driverWeeklyPopupStorageKey = "safe-auto-house-driver-weekly-popup";
const authAccountsStorageKey = "safe-auto-house-auth-accounts";
const registrationRequestsStorageKey = "safe-auto-house-registration-requests";
const driverStatusesStorageKey = "safe-auto-house-driver-statuses";
const profileStorageKey = "safe-auto-house-profile";
const settingsStorageKey = "safe-auto-house-settings";
const adminDriverSettingsStorageKey = "safe-auto-house-admin-driver-settings";
const updatesStorageKey = "safe-auto-house-updates";
const personalMessagesStorageKey = "safe-auto-house-personal-messages";
const salesInstallmentsStorageKey = "safe-auto-house-sales-installments";

const demoAuthAccounts: AuthAccount[] = [
  {
    email: "admin@safeauto.gr",
    password: "admin123",
    role: "admin",
    label: "Διαχειριστής",
    taxNumber: "123456789",
  },
  {
    email: "driver@safeauto.gr",
    password: "driver123",
    role: "driver",
    driverId: "main",
    label: "Οδηγός Demo",
  },
];

const defaultExpenseSettings: ExpenseSettings = {
  rentPerDay: 0,
  insurancePerDay: 0,
  tollsPerDay: 0,
  vatPercent: 24,
  appTaxPercent: 0,
  electricPricePerKm: 0,
};

const defaultProfile = {
  firstName: "",
  lastName: "",
  age: 0,
  phone: "",
  email: "",
  plate: "",
  photoUrl: "",
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
};

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const savedValue = window.localStorage.getItem(key);
    return savedValue ? (JSON.parse(savedValue) as T) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1400);
    return () => window.clearTimeout(timer);
  }, []);
  const [activeDriverId, setActiveDriverId] = useState("main");
  const [loginMode, setLoginMode] = useState<LoginMode>("choice");
  const [authAccounts, setAuthAccounts] = useState<AuthAccount[]>(() =>
    readStoredValue(authAccountsStorageKey, demoAuthAccounts)
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    adminTaxNumber: "",
    password: "",
  });
  const [registrationRequests, setRegistrationRequests] = useState<
    RegistrationRequest[]
  >(() => readStoredValue(registrationRequestsStorageKey, []));
  const [driverTab, setDriverTab] = useState("home");
  const [adminTab, setAdminTab] = useState("drivers");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<DayKey>(() =>
    getDayKey(new Date())
  );
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(3);
  const [selectedHistoryWeek, setSelectedHistoryWeek] = useState<number | null>(
    null
  );
  const [selectedAdminDriverId, setSelectedAdminDriverId] = useState("main");
  const [selectedAdminMonth, setSelectedAdminMonth] = useState(3);
  const [selectedAdminWeek, setSelectedAdminWeek] = useState<number | null>(null);
  const [selectedAdminDayKey, setSelectedAdminDayKey] = useState<string | null>(
    null
  );
  const [excelImportMessage, setExcelImportMessage] = useState("");
  const [showDriverWeeklyPopup, setShowDriverWeeklyPopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [driverStatuses, setDriverStatuses] = useState<Record<string, DriverStatus>>(() =>
    readStoredValue(driverStatusesStorageKey, {
      main: "active",
      "driver-2": "active",
      "driver-3": "active",
    })
  );
  const [showSalesInstallmentForm, setShowSalesInstallmentForm] =
    useState(false);
  const [salesInstallments, setSalesInstallments] = useState<
    SalesInstallment[]
  >(() => readStoredValue(salesInstallmentsStorageKey, []));
  const [salesInstallmentForm, setSalesInstallmentForm] =
    useState<SalesInstallment>({
      id: "",
      plate: "",
      price: 0,
      vehicleType: "",
      totalPrice: 0,
      monthlyPrice: 0,
      totalInstallments: 0,
      paidInstallments: 0,
      lastPaidMonth: "",
      taxiLicenseMonthlyInstallment: 0,
      ownerName: "",
      carModel: "",
    });
  const [vehicleType] = useState<VehicleType>("fuel");
  const currentWeekKey = getWeekKey(currentDate);
  const [selectedProfitWeekKey, setSelectedProfitWeekKey] =
    useState(currentWeekKey);
  const [selectedTurnoverWeekKey, setSelectedTurnoverWeekKey] =
    useState(currentWeekKey);

  const [profile, setProfile] = useState(() =>
    readStoredValue(profileStorageKey, defaultProfile)
  );

  const [allWeeks, setAllWeeks] = useState<Record<string, Record<DayKey, DayData>>>(() => {
    const now = new Date();
    const previousWeekStart = addDays(getWeekStart(now), -7);
    const demoPreviousWeek = createWeekDays(previousWeekStart);

    demoPreviousWeek.mon = {
      ...demoPreviousWeek.mon,
      freenow: 500,
      saved: true,
    };

    const currentWeek = {
      [getWeekKey(previousWeekStart)]: demoPreviousWeek,
      [getWeekKey(now)]: createWeekDays(now),
    };

    if (typeof window === "undefined") return currentWeek;

    try {
      const savedWeeks = window.localStorage.getItem(weekStorageKey);
      if (!savedWeeks) return currentWeek;

      return normalizeStoredWeeks({
        ...currentWeek,
        ...(JSON.parse(savedWeeks) as Record<string, Record<DayKey, DayData>>),
      });
    } catch {
      window.localStorage.removeItem(weekStorageKey);
      return currentWeek;
    }
  });

  const [settings, setSettings] = useState<ExpenseSettings>(() =>
    readStoredValue(settingsStorageKey, defaultExpenseSettings)
  );
  const [adminDriverSettings, setAdminDriverSettings] = useState<
    Record<string, ExpenseSettings>
  >(() =>
    readStoredValue(adminDriverSettingsStorageKey, {
      "driver-2": {
        rentPerDay: 42,
        insurancePerDay: 12,
        tollsPerDay: 6,
        vatPercent: 24,
        appTaxPercent: 3,
        electricPricePerKm: 0,
      },
      "driver-3": {
        rentPerDay: 50,
        insurancePerDay: 10,
        tollsPerDay: 4,
        vatPercent: 24,
        appTaxPercent: 2,
        electricPricePerKm: 0.08,
      },
    })
  );

  const [updates, setUpdates] = useState<AnnouncementPost[]>([
    ...readStoredValue(updatesStorageKey, [
      {
        id: "welcome-post",
        message: "Καλωσήρθες στο Safe Auto-House portal.",
        createdAt: new Date().toISOString(),
      },
    ]),
  ]);
  const [newUpdate, setNewUpdate] = useState("");
  const [newUpdateImage, setNewUpdateImage] = useState("");
  const [newPersonalMessage, setNewPersonalMessage] = useState("");
  const [newPersonalMessageImage, setNewPersonalMessageImage] = useState("");
  const [personalMessageDriverSearch, setPersonalMessageDriverSearch] =
    useState("");
  const [personalMessages, setPersonalMessages] = useState<
    Record<string, AnnouncementPost[]>
  >(() => readStoredValue(personalMessagesStorageKey, {}));
  const [weeklyAppProfits, setWeeklyAppProfits] = useState<
    Record<string, WeeklyAppRevenue>
  >(() => {
    if (typeof window === "undefined") return {};

    try {
      const savedProfits = window.localStorage.getItem(profitStorageKey);
      return savedProfits
        ? (JSON.parse(savedProfits) as Record<string, WeeklyAppRevenue>)
        : {};
    } catch {
      window.localStorage.removeItem(profitStorageKey);
      return {};
    }
  });
  const [officialDriverWeeks, setOfficialDriverWeeks] = useState<
    Record<string, Record<string, OfficialDriverWeek>>
  >(() => {
    if (typeof window === "undefined") return {};

    try {
      const savedOfficialWeeks = window.localStorage.getItem(
        officialDriverWeeksStorageKey
      );
      return savedOfficialWeeks
        ? (JSON.parse(savedOfficialWeeks) as Record<
            string,
            Record<string, OfficialDriverWeek>
          >)
        : {};
    } catch {
      window.localStorage.removeItem(officialDriverWeeksStorageKey);
      return {};
    }
  });
  const normalizedAllWeeks = normalizeStoredWeeks(allWeeks);
  const days = normalizedAllWeeks[currentWeekKey] ?? createWeekDays(currentDate);
  const currentProfitWeek = weeklyAppProfits[selectedProfitWeekKey] ?? {
    freenow: 0,
    bolt: 0,
    uber: 0,
  };
  const savedProfitWeeks = Object.entries(weeklyAppProfits)
    .filter(([, week]) => week.savedAt)
    .sort(([weekA], [weekB]) => weekB.localeCompare(weekA));
  const appProfitTotal =
    currentProfitWeek.freenow + currentProfitWeek.bolt + currentProfitWeek.uber;
  const appProfitTax = appProfitTotal * 0.12;
  const appProfitAfterTax = appProfitTotal - appProfitTax;
  const selected = days[selectedDay];
  const selectedDayLabel = greekWeekDays[selectedDay].label;
  const selectedCalc = calcDay(selected);
  const historyMonths = buildHistoryMonths(normalizedAllWeeks, calcDay);
  const driverDisplayName =
    `${profile.firstName} ${profile.lastName}`.trim() || "Οδηγός Demo";
  const adminDrivers = [
    {
      id: "main",
      name: driverDisplayName === "Οδηγός Demo" ? "Οδηγός Demo" : driverDisplayName,
      phone: profile.phone || "-",
      email: profile.email || "-",
      plate: profile.plate || "-",
      vehicleType,
      weeks: normalizedAllWeeks,
      settings,
      status: driverStatuses.main ?? "active",
    },
    {
      id: "driver-2",
      name: "Νίκος Παπαδόπουλος",
      phone: "6900000001",
      email: "nikos@example.com",
      plate: "ΤΑΧ-1020",
      vehicleType: "fuel" as VehicleType,
      weeks: createDemoDriverWeeks(1),
      settings: adminDriverSettings["driver-2"],
      status: driverStatuses["driver-2"] ?? "active",
    },
    {
      id: "driver-3",
      name: "Μαρία Δημητρίου",
      phone: "6900000002",
      email: "maria@example.com",
      plate: "ΤΑΧ-2040",
      vehicleType: "electric" as VehicleType,
      weeks: createDemoDriverWeeks(2),
      settings: adminDriverSettings["driver-3"],
      status: driverStatuses["driver-3"] ?? "active",
    },
  ];
  const calculateWeeklyDriverCollections = (weekKey: string) =>
    adminDrivers.reduce(
      (totals, driver) => {
        const weekDays = driver.weeks[weekKey];
        if (!weekDays) return totals;

        Object.values(weekDays).forEach((day) => {
          const dayCalc = calculateDayFinancials(
            day,
            driver.settings,
            driver.vehicleType
          );

          if (day.saved) {
            totals.rent += driver.settings.rentPerDay;
            totals.workedDays += 1;
          }

          totals.vat += dayCalc.vatAmount;
        });

        return totals;
      },
      {
        rent: 0,
        vat: 0,
        workedDays: 0,
      }
    );
  const selectedProfitDriverCollections =
    calculateWeeklyDriverCollections(selectedProfitWeekKey);
  const selectedProfitDriverTotal =
    selectedProfitDriverCollections.rent + selectedProfitDriverCollections.vat;
  const selectedProfitGrandTotal = selectedProfitDriverTotal + appProfitTax;
  const selectedTurnoverCollections =
    calculateWeeklyDriverCollections(selectedTurnoverWeekKey);
  const selectedTurnoverAppProfit = weeklyAppProfits[selectedTurnoverWeekKey] ?? {
    freenow: 0,
    bolt: 0,
    uber: 0,
  };
  const selectedTurnoverAppTax =
    (selectedTurnoverAppProfit.freenow +
      selectedTurnoverAppProfit.bolt +
      selectedTurnoverAppProfit.uber) *
    0.12;
  const selectedTurnoverTotal =
    selectedTurnoverCollections.rent +
    selectedTurnoverCollections.vat +
    selectedTurnoverAppTax;
  const turnoverRecords = buildTurnoverRecordsFromProfits(
    weeklyAppProfits,
    calculateWeeklyDriverCollections
  );
  const savedTurnoverRecord = turnoverRecords[selectedTurnoverWeekKey];
  const turnoverMonths = buildTurnoverMonths(turnoverRecords);
  const turnoverFourMonthGroups = buildTurnoverFourMonthGroups(turnoverMonths);
  /*
  const weeklyDriverCollections = adminDrivers.reduce(
    (totals, driver) => {
      const weekDays = driver.weeks[currentWeekKey];
      if (!weekDays) return totals;

      Object.values(weekDays).forEach((day) => {
        const dayCalc = calculateDayFinancials(
          day,
          driver.settings,
          driver.vehicleType
        );

        if (day.saved) {
          totals.rent += driver.settings.rentPerDay;
          totals.workedDays += 1;
        }

        totals.vat += dayCalc.vatAmount;
      });

      return totals;
    },
    {
      rent: 0,
      vat: 0,
      workedDays: 0,
    }
  );
  */
  const visibleAdminDrivers = adminDrivers.filter((driver) => {
    const search = driverSearch.trim().toLowerCase();
    if (!search) return true;

    return [driver.name, driver.phone, driver.email, driver.plate]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
  const selectedAdminDriver =
    adminDrivers.find((driver) => driver.id === selectedAdminDriverId) ??
    adminDrivers[0];
  const visiblePersonalMessageDrivers = adminDrivers.filter((driver) => {
    const search = personalMessageDriverSearch.trim().toLowerCase();
    if (!search) return true;

    return [driver.name, driver.phone, driver.email, driver.plate]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
  const selectedAdminSettings = selectedAdminDriver.settings;
  const selectedAdminOfficialWeek =
    officialDriverWeeks[currentWeekKey]?.[selectedAdminDriver.id] ?? null;
  const selectedAdminTurnover = normalizeOfficialDriverWeek(
    selectedAdminOfficialWeek
  );
  const selectedAdminCurrentWeekDays =
    selectedAdminDriver.weeks[currentWeekKey] ?? createWeekDays(currentDate);
  const selectedAdminWeeklyBalance = selectedAdminOfficialWeek
    ? calculateOfficialDriverBalance(
        selectedAdminOfficialWeek,
        selectedAdminSettings
      ).balance
    : Object.values(selectedAdminCurrentWeekDays).reduce(
        (balance, day) =>
          balance +
          calculateCompanyRevenueFromDriver(day, selectedAdminSettings).netIncome -
          calculateDayFinancials(
            day,
            selectedAdminSettings,
            selectedAdminDriver.vehicleType
          ).netIncome,
        0
      );
  const adminHistoryMonths = buildHistoryMonths(
    selectedAdminDriver.weeks,
    (day) =>
      calculateCompanyRevenueFromDriver(
        day,
        selectedAdminSettings
      )
  );
  const activeAdminMonth = adminHistoryMonths[selectedAdminMonth];
  const activeAdminWeek =
    selectedAdminWeek !== null
      ? activeAdminMonth.weeks[selectedAdminWeek]
      : null;
  const activeAdminDay =
    selectedAdminDayKey !== null
      ? activeAdminWeek?.sourceDays.find(
          (day) => day.dateKey === selectedAdminDayKey
        ) ?? null
      : null;
  const activeAdminDayCalc = activeAdminDay
    ? calculateDayFinancials(
        activeAdminDay,
        selectedAdminSettings,
        selectedAdminDriver.vehicleType
      )
    : null;
  const activeAdminCompanyRevenue = activeAdminDay
    ? calculateCompanyRevenueFromDriver(activeAdminDay, selectedAdminSettings)
    : null;
  const activeMonth = historyMonths[selectedHistoryMonth];
  const activeWeek =
    selectedHistoryWeek !== null
      ? activeMonth.weeks[selectedHistoryWeek]
      : null;

  useEffect(() => {
    const normalizedWeeks = normalizeStoredWeeks(allWeeks);
    window.localStorage.setItem(weekStorageKey, JSON.stringify(normalizedWeeks));
  }, [allWeeks]);

  useEffect(() => {
    window.localStorage.setItem(
      authAccountsStorageKey,
      JSON.stringify(authAccounts)
    );
  }, [authAccounts]);

  useEffect(() => {
    window.localStorage.setItem(
      registrationRequestsStorageKey,
      JSON.stringify(registrationRequests)
    );
  }, [registrationRequests]);

  useEffect(() => {
    window.localStorage.setItem(
      driverStatusesStorageKey,
      JSON.stringify(driverStatuses)
    );
  }, [driverStatuses]);

  useEffect(() => {
    window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    window.localStorage.setItem(
      adminDriverSettingsStorageKey,
      JSON.stringify(adminDriverSettings)
    );
  }, [adminDriverSettings]);

  useEffect(() => {
    window.localStorage.setItem(updatesStorageKey, JSON.stringify(updates));
  }, [updates]);

  useEffect(() => {
    window.localStorage.setItem(
      personalMessagesStorageKey,
      JSON.stringify(personalMessages)
    );
  }, [personalMessages]);

  useEffect(() => {
    window.localStorage.setItem(
      salesInstallmentsStorageKey,
      JSON.stringify(salesInstallments)
    );
  }, [salesInstallments]);

  useEffect(() => {
    window.localStorage.setItem(
      profitStorageKey,
      JSON.stringify(weeklyAppProfits)
    );
  }, [weeklyAppProfits]);

  useEffect(() => {
    window.localStorage.setItem(
      officialDriverWeeksStorageKey,
      JSON.stringify(officialDriverWeeks)
    );
  }, [officialDriverWeeks]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
      setSelectedDay(getDayKey(now));
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  function calcDay(d: DayData) {
    return calculateDayFinancials(d, settings, vehicleType);
  }

  const previousWeekKey = getWeekKey(addDays(parseDateKey(currentWeekKey), -7));
  const previousWeekDays = normalizeWeekDays(
    allWeeks[previousWeekKey] ?? createWeekDays(parseDateKey(previousWeekKey)),
    parseDateKey(previousWeekKey)
  );
  const previousWeekTotals = Object.values(previousWeekDays).reduce(
    (acc, d) => {
      const c = calcDay(d);

      acc.net += c.netIncome;
      acc.freenow += d.freenow;
      acc.bolt += d.bolt;
      acc.uber += d.uber;

      return acc;
    },
    {
      net: 0,
      freenow: 0,
      bolt: 0,
      uber: 0,
    }
  );
  const previousWeekBestApp = getBestAppName({
    freenow: previousWeekTotals.freenow,
    bolt: previousWeekTotals.bolt,
    uber: previousWeekTotals.uber,
  });
  const previousWeekPerformance =
    previousWeekTotals.net >= 500
      ? "Πολύ καλά"
      : previousWeekTotals.net <= 200
        ? "Όχι τόσο καλά"
        : "Καλά";

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
    setAllWeeks((previousWeeks) => {
      const weekDays = normalizeWeekDays(
        previousWeeks[currentWeekKey] ?? createWeekDays(currentDate),
        parseDateKey(currentWeekKey)
      );

      return {
        ...previousWeeks,
        [currentWeekKey]: {
          ...weekDays,
          [selectedDay]: {
            ...weekDays[selectedDay],
            [field]: value,
          },
        },
      };
    });
  }

  function updateAdminDriverSetting(
    driverId: string,
    field: keyof ExpenseSettings,
    value: number
  ) {
    if (driverId === "main") {
      setSettings({
        ...settings,
        [field]: value,
      });
      return;
    }

    setAdminDriverSettings({
      ...adminDriverSettings,
      [driverId]: {
        ...(adminDriverSettings[driverId] ?? defaultExpenseSettings),
        [field]: value,
      },
    });
  }

  function updateDriverStatus(driverId: string, status: DriverStatus) {
    setDriverStatuses({
      ...driverStatuses,
      [driverId]: status,
    });
  }

  function updateWeeklyAppProfit(field: keyof WeeklyAppRevenue, value: number) {
    setWeeklyAppProfits({
      ...weeklyAppProfits,
      [selectedProfitWeekKey]: {
        ...currentProfitWeek,
        [field]: value,
      },
    });
  }

  async function importOfficialDriverExcel(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    const nextOfficialWeeks = {
      ...officialDriverWeeks,
      [selectedProfitWeekKey]: {
        ...(officialDriverWeeks[selectedProfitWeekKey] ?? {}),
      },
    };
    let importedRows = 0;
    let freenowTotal = 0;
    let boltTotal = 0;
    let uberTotal = 0;

    rows.forEach((row) => {
      const driver = findDriverFromExcelRow(row, adminDrivers);
      if (!driver) return;

      const freenowCard = getExcelNumber(row, [
        "freenow κάρτες",
        "free now κάρτες",
        "freenow card",
        "free now card",
      ]);
      const freenowCash = getExcelNumber(row, [
        "freenow μετρητα",
        "free now μετρητα",
        "freenow cash",
        "free now cash",
      ]);
      const boltCard = getExcelNumber(row, ["bolt κάρτες", "bolt card"]);
      const boltCash = getExcelNumber(row, ["bolt μετρητα", "bolt cash"]);
      const uberCard = getExcelNumber(row, ["uber κάρτες", "uber card"]);
      const uberCash = getExcelNumber(row, ["uber μετρητα", "uber cash"]);
      const freenow =
        getExcelNumber(row, ["freenow", "free now"]) ||
        freenowCard + freenowCash;
      const bolt = getExcelNumber(row, ["bolt"]) || boltCard + boltCash;
      const uber = getExcelNumber(row, ["uber"]) || uberCard + uberCash;
      const appTurnover =
        getExcelNumber(row, [
          "σύνολο εφαρμογών",
          "τζιρος εφαρμογων",
          "σύνολο",
          "turnover",
          "apps total",
        ]) ||
        freenow + bolt + uber;
      const cardPayments = getExcelNumber(row, [
        "πληρωμες με καρτα",
        "κάρτες",
        "card",
        "card payments",
      ]) || freenowCard + boltCard + uberCard;
      const workedDays = getExcelNumber(row, [
        "μερες",
        "ημερες",
        "μερες εργασιας",
        "worked days",
      ]);
      const vat = getExcelNumber(row, ["fpa", "fpa", "vat"]);

      nextOfficialWeeks[selectedProfitWeekKey][driver.id] = {
        appTurnover,
        cardPayments,
        freenowCard,
        freenowCash,
        uberCard,
        uberCash,
        boltCard,
        boltCash,
        workedDays,
        vat,
      };

      freenowTotal += freenow;
      boltTotal += bolt;
      uberTotal += uber;
      importedRows += 1;
    });

    setOfficialDriverWeeks(nextOfficialWeeks);
    setWeeklyAppProfits({
      ...weeklyAppProfits,
      [selectedProfitWeekKey]: {
        ...currentProfitWeek,
        freenow: freenowTotal || currentProfitWeek.freenow,
        bolt: boltTotal || currentProfitWeek.bolt,
        uber: uberTotal || currentProfitWeek.uber,
      },
    });
    setExcelImportMessage(
      importedRows > 0
        ? `Περάστηκαν ${importedRows} γραμμές από το Excel.`
        : "Δεν βρέθηκαν οδηγοί που να ταιριάζουν με το Excel."
    );
    event.target.value = "";
  }

  async function importAppExcel(
    appName: "FreeNow" | "Uber" | "Bolt",
    event: ChangeEvent<HTMLInputElement>
  ) {
    await importOfficialDriverExcel(event);
    setExcelImportMessage(`${appName}: ${excelImportMessage || "Το αρχείο διαβάστηκε."}`);
  }

  function saveSelectedProfitWeek() {
    setWeeklyAppProfits({
      ...weeklyAppProfits,
      [selectedProfitWeekKey]: {
        ...currentProfitWeek,
        savedAt: new Date().toISOString(),
      },
    });
  }

  function moveProfitWeek(direction: -1 | 1) {
    const nextWeek = addDays(parseDateKey(selectedProfitWeekKey), direction * 7);
    setSelectedProfitWeekKey(getWeekKey(nextWeek));
  }

  function moveTurnoverWeek(direction: -1 | 1) {
    const nextWeek = addDays(parseDateKey(selectedTurnoverWeekKey), direction * 7);
    setSelectedTurnoverWeekKey(getWeekKey(nextWeek));
  }

  function saveSalesInstallment() {
    if (!salesInstallmentForm.plate.trim()) return;

    const nextInstallment = {
      ...salesInstallmentForm,
      id: salesInstallmentForm.id || crypto.randomUUID(),
    };

    setSalesInstallments(
      salesInstallmentForm.id
        ? salesInstallments.map((installment) =>
            installment.id === salesInstallmentForm.id
              ? nextInstallment
              : installment
          )
        : [nextInstallment, ...salesInstallments]
    );
    setSalesInstallmentForm({
      id: "",
      plate: "",
      price: 0,
      vehicleType: "",
      totalPrice: 0,
      monthlyPrice: 0,
      totalInstallments: 0,
      paidInstallments: 0,
      lastPaidMonth: "",
      taxiLicenseMonthlyInstallment: 0,
      ownerName: "",
      carModel: "",
    });
    setShowSalesInstallmentForm(false);
  }

  function editSalesInstallment(installment: SalesInstallment) {
    setSalesInstallmentForm(installment);
    setShowSalesInstallmentForm(true);
  }

  function markSalesInstallmentPaid(installmentId: string) {
    const currentMonth = getMonthInputValue(new Date());

    setSalesInstallments(
      salesInstallments.map((installment) => {
        if (installment.id !== installmentId) return installment;

        return {
          ...installment,
          paidInstallments: Math.min(
            installment.paidInstallments + 1,
            installment.totalInstallments || installment.paidInstallments + 1
          ),
          lastPaidMonth: currentMonth,
        };
      })
    );
  }

  function publishUpdate() {
    if (!newUpdate.trim() && !newUpdateImage) return;

    setUpdates([
      {
        id: crypto.randomUUID(),
        message: newUpdate,
        imageUrl: newUpdateImage || undefined,
        createdAt: new Date().toISOString(),
      },
      ...updates,
    ]);
    setNewUpdate("");
    setNewUpdateImage("");
  }

  function sendPersonalMessage() {
    if (!newPersonalMessage.trim() && !newPersonalMessageImage) return;

    setPersonalMessages({
      ...personalMessages,
      [selectedAdminDriver.id]: [
        {
          id: crypto.randomUUID(),
          message: newPersonalMessage,
          imageUrl: newPersonalMessageImage || undefined,
          createdAt: new Date().toISOString(),
        },
        ...(personalMessages[selectedAdminDriver.id] ?? []),
      ],
    });
    setNewPersonalMessage("");
    setNewPersonalMessageImage("");
  }

  function handlePostImageUpload(
    event: ChangeEvent<HTMLInputElement>,
    onLoad: (imageUrl: string) => void
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onLoad(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile({ ...profile, photoUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  }

  async function handleLogin() {
    if (loginLoading) return;

    if (isSupabaseConfigured && supabase) {
      setLoginLoading(true);
      setLoginError("");

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        });

      if (authError || !authData.user) {
        setLoginLoading(false);
        setLoginError("Λάθος email ή κωδικός.");
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, first_name, last_name, email, phone")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !userProfile) {
        setLoginLoading(false);
        setLoginError("Ο λογαριασμός υπάρχει, αλλά δεν βρέθηκε προφίλ.");
        return;
      }

      if (loginMode !== "choice" && userProfile.role !== loginMode) {
        setLoginLoading(false);
        setLoginError(
          userProfile.role === "admin"
            ? "Αυτός ο λογαριασμός είναι Admin."
            : "Αυτός ο λογαριασμός είναι οδηγού."
        );
        return;
      }

      if (userProfile.role === "driver") {
        const { data: driverRow, error: driverError } = await supabase
          .from("drivers")
          .select("id, status, first_name, last_name, email, phone")
          .eq("user_id", authData.user.id)
          .single();

        if (driverError || !driverRow) {
          setLoginLoading(false);
          setLoginError("Δεν βρέθηκε καρτέλα οδηγού για αυτόν τον λογαριασμό.");
          return;
        }

        if (driverRow.status !== "active") {
          setLoginLoading(false);
          setLoginError(getBlockedLoginMessage(driverRow.status));
          return;
        }

        setProfile({
          ...profile,
          firstName: driverRow.first_name,
          lastName: driverRow.last_name,
          email: driverRow.email,
          phone: driverRow.phone,
        });
        setActiveDriverId(driverRow.id);
        setDriverTab("home");
        openDriverPortal(driverRow.id);
        setLoginError("");
        setLoginPassword("");
        setLoginLoading(false);
        return;
      }

      setRole("admin");
      setAdminTab("drivers");
      setLoginError("");
      setLoginPassword("");
      setLoginLoading(false);
      return;
    }

    const account = authAccounts.find(
      (demoAccount) =>
        demoAccount.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        demoAccount.password === loginPassword &&
        (loginMode === "choice" || demoAccount.role === loginMode)
    );

    if (!account) {
      setLoginError("Λάθος email ή κωδικός.");
      return;
    }

    if (account.role === "driver") {
      const driverId = account.driverId ?? "main";
      const driverStatus = driverStatuses[driverId] ?? "active";

      if (driverStatus !== "active") {
        setLoginError(getBlockedLoginMessage(driverStatus));
        return;
      }

      setActiveDriverId(driverId);
      setDriverTab("home");
      openDriverPortal(driverId);
      setLoginError("");
      setLoginPassword("");
      return;
    }

    setRole("admin");
    setAdminTab("drivers");
    setLoginError("");
    setLoginPassword("");
  }

  function startLoginMode(mode: "driver" | "admin") {
    setLoginMode(mode);
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
  }

  function createDriverAccount() {
    const email = registerForm.email.trim().toLowerCase();
    const adminTaxNumber = registerForm.adminTaxNumber.trim();
    const matchedAdmin = authAccounts.find(
      (account) =>
        account.role === "admin" &&
        account.taxNumber === adminTaxNumber
    );

    if (
      !registerForm.firstName.trim() ||
      !registerForm.lastName.trim() ||
      !email ||
      !registerForm.phone.trim() ||
      !adminTaxNumber ||
      !registerForm.password
    ) {
      setLoginError("Συμπλήρωσε όλα τα στοιχεία για να φτιάξεις λογαριασμό.");
      return;
    }

    if (authAccounts.some((account) => account.email.toLowerCase() === email)) {
      setLoginError("Υπάρχει ήδη λογαριασμός με αυτό το email.");
      return;
    }

    if (
      registrationRequests.some(
        (request) => request.email.toLowerCase() === email
      )
    ) {
      setLoginError("Υπάρχει ήδη αίτημα εγγραφής με αυτό το email.");
      return;
    }

    if (!matchedAdmin) {
      setLoginError("Δεν βρέθηκε admin με αυτό το ΑΦΜ.");
      return;
    }

    setRegistrationRequests([
      {
        id: crypto.randomUUID(),
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email,
        phone: registerForm.phone,
        password: registerForm.password,
        adminEmail: matchedAdmin.email,
        adminTaxNumber,
        createdAt: new Date().toISOString(),
      },
      ...registrationRequests,
    ]);
    setRegisterForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      adminTaxNumber: "",
      password: "",
    });
    setLoginPassword("");
    setLoginError(
      "Το αίτημα στάλθηκε στον admin. Θα μπορείς να συνδεθείς όταν το εγκρίνει."
    );
  }

  function approveRegistrationRequest(request: RegistrationRequest) {
    setAuthAccounts([
      ...authAccounts,
      {
        email: request.email,
        password: request.password,
        role: "driver",
        driverId: "main",
        label: `${request.firstName} ${request.lastName}`,
      },
    ]);
    setProfile({
      ...profile,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,
    });
    setRegistrationRequests(
      registrationRequests.filter((item) => item.id !== request.id)
    );
  }

  function deleteRegistrationRequest(requestId: string) {
    setRegistrationRequests(
      registrationRequests.filter((request) => request.id !== requestId)
    );
  }

  function logout() {
    setRole(null);
    setShowDriverWeeklyPopup(false);
    setLoginPassword("");
    setLoginError("");
  }

  function openDriverPortal(driverId: string) {
    if ((driverStatuses[driverId] ?? "active") !== "active") return;

    const popupSeenKey = `${driverWeeklyPopupStorageKey}-${driverId}-${currentWeekKey}`;
    const hasSeenWeeklyPopup =
      typeof window !== "undefined" &&
      window.localStorage.getItem(popupSeenKey) === "seen";

    setShowDriverWeeklyPopup(!hasSeenWeeklyPopup);
    setRole("driver");
  }

  function closeDriverWeeklyPopup() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        `${driverWeeklyPopupStorageKey}-${activeDriverId}-${currentWeekKey}`,
        "seen"
      );
    }

    setShowDriverWeeklyPopup(false);
  }

  if (showSplash) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-3xl border border-[#E8B858]/30 bg-zinc-950/80 p-6 shadow-2xl shadow-[#E8B858]/10">
            <img
              src="/logo.png"
              alt="Safe Auto-House"
              className="h-28 w-28 object-contain sm:h-36 sm:w-36"
            />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E8B858]">
              Safe Auto-House
            </p>
            <p className="mt-3 text-base font-bold text-zinc-300">
              Φόρτωση εφαρμογής οδηγών
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (role === null) {
    const loginTitle =
      loginMode === "driver"
        ? "Σύνδεση ως οδηγός"
        : loginMode === "admin"
          ? "Σύνδεση ως Admin"
          : loginMode === "register"
            ? "Δημιουργία λογαριασμού"
            : "Καλωσήρθες";

    return (
      <main
        className="min-h-screen bg-black bg-cover bg-center p-6 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.92)), url('/login-bg.png')",
        }}
      >
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-8 py-10 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 text-center">
            <h1 className="text-5xl font-black italic leading-none">Safe</h1>
            <p className="text-base font-bold italic text-[#F0C060]">
              Auto-House
            </p>
          </div>
          <div className="mb-6 h-1 w-16 rounded-full bg-[#E8B858]" />
          <h1 className="mb-2 text-center text-3xl font-black">{loginTitle}</h1>
          <p className="mb-8 text-center text-base text-zinc-300">
            {loginMode === "choice"
              ? "Επέλεξε πώς θέλεις να συνεχίσεις."
              : loginMode === "register"
                ? "Συμπλήρωσε τα στοιχεία σου για να φτιάξεις λογαριασμό οδηγού."
                : "Βάλε email και κωδικό για πρόσβαση στο portal."}
          </p>

          {loginMode === "choice" && (
            <div className="w-full max-w-md space-y-4">
              <button
                onClick={() => startLoginMode("driver")}
                className="w-full rounded-2xl border border-[#E8B858] bg-black/70 p-5 text-left transition hover:bg-[#E8B858] hover:text-black"
              >
                <span className="block text-xl font-black">
                  Σύνδεση ως οδηγός
                </span>
                <span className="mt-2 block text-sm text-zinc-400">
                  Για ημερήσια έσοδα, ενημερώσεις και ιστορικό.
                </span>
              </button>

              <button
                onClick={() => startLoginMode("admin")}
                className="w-full rounded-2xl border border-zinc-700 bg-black/70 p-5 text-left transition hover:border-[#E8B858] hover:bg-zinc-900"
              >
                <span className="block text-xl font-black">
                  Σύνδεση ως Admin
                </span>
                <span className="mt-2 block text-sm text-zinc-400">
                  Για διαχείριση οδηγών, κερδών και ανακοινώσεων.
                </span>
              </button>

              <div className="rounded-2xl border border-zinc-800 bg-black/70 p-4 text-center">
                <span className="text-zinc-400">Δεν έχεις λογαριασμό; </span>
                <button
                  onClick={() => {
                    setLoginMode("register");
                    setLoginError("");
                  }}
                  className="font-black text-[#F0C060] hover:text-[#F6D486]"
                >
                  Φτιάξε τώρα έναν
                </button>
              </div>
            </div>
          )}

          {(loginMode === "driver" || loginMode === "admin") && (
            <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-black/70 p-5">
              <InputText
                label="Email"
                value={loginEmail}
                onChange={(value) => {
                  setLoginEmail(value);
                  setLoginError("");
                }}
              />
              <InputText
                label="Κωδικός"
                value={loginPassword}
                onChange={(value) => {
                  setLoginPassword(value);
                  setLoginError("");
                }}
                password
              />

              {loginError && (
                <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm font-bold text-red-300">
                  {loginError}
                </p>
              )}

              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="w-full rounded-xl bg-[#E8B858] py-3 text-base font-bold text-black hover:bg-[#F0C060] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginLoading ? "Σύνδεση..." : "Σύνδεση"}
              </button>

              <button
                onClick={() => {
                  setLoginMode("choice");
                  setLoginError("");
                }}
                className="w-full rounded-xl border border-zinc-800 py-3 text-base font-bold text-zinc-300 hover:bg-zinc-900"
              >
                Πίσω
              </button>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-400">
                <p className="font-bold text-zinc-300">Demo στοιχεία</p>
                {loginMode === "admin" ? (
                  <p className="mt-2">Admin: admin@safeauto.gr / admin123</p>
                ) : (
                  <p className="mt-2">Οδηγός: driver@safeauto.gr / driver123</p>
                )}
              </div>
            </div>
          )}

          {loginMode === "register" && (
            <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-black/70 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputText
                  label="Όνομα"
                  value={registerForm.firstName}
                  onChange={(value) =>
                    setRegisterForm({ ...registerForm, firstName: value })
                  }
                />
                <InputText
                  label="Επίθετο"
                  value={registerForm.lastName}
                  onChange={(value) =>
                    setRegisterForm({ ...registerForm, lastName: value })
                  }
                />
              </div>
              <InputText
                label="Email"
                value={registerForm.email}
                onChange={(value) =>
                  setRegisterForm({ ...registerForm, email: value })
                }
              />
              <InputText
                label="Τηλέφωνο επικοινωνίας"
                value={registerForm.phone}
                onChange={(value) =>
                  setRegisterForm({ ...registerForm, phone: value })
                }
              />
              <InputText
                label="ΑΦΜ admin / εταιρείας"
                value={registerForm.adminTaxNumber}
                onChange={(value) =>
                  setRegisterForm({ ...registerForm, adminTaxNumber: value })
                }
              />
              <InputText
                label="Κωδικός"
                value={registerForm.password}
                onChange={(value) =>
                  setRegisterForm({ ...registerForm, password: value })
                }
                password
              />

              {loginError && (
                <p className="rounded-xl border border-[#E8B858]/40 bg-[#E8B858]/10 p-3 text-sm font-bold text-[#F6D486]">
                  {loginError}
                </p>
              )}

              <button
                onClick={createDriverAccount}
                className="w-full rounded-xl bg-[#E8B858] py-3 text-base font-bold text-black hover:bg-[#F0C060]"
              >
                Αποστολή αιτήματος
              </button>

              <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-400">
                Demo ΑΦΜ admin: 123456789
              </p>

              <button
                onClick={() => {
                  setLoginMode("choice");
                  setLoginError("");
                }}
                className="w-full rounded-xl border border-zinc-800 py-3 text-base font-bold text-zinc-300 hover:bg-zinc-900"
              >
                Πίσω
              </button>
            </div>
          )}

          <div className="mt-8 border-t border-white/10 pt-5 text-center text-base text-zinc-400">
            <p>Ασφαλής πρόσβαση - Safe Auto-House Portal</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-zinc-500">
              <a href="/privacy" className="transition hover:text-[#F0C060]">
                Πολιτική απορρήτου
              </a>
              <span className="text-zinc-700">•</span>
              <a href="/terms" className="transition hover:text-[#F0C060]">
                Όροι χρήσης
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-base leading-relaxed text-white lg:pl-72">
      {role === "driver" && showDriverWeeklyPopup && (
        <DriverWeeklyPopup
          weekRange={formatWeekRange(previousWeekKey)}
          net={previousWeekTotals.net}
          performance={previousWeekPerformance}
          bestApp={previousWeekBestApp}
          freenow={previousWeekTotals.freenow}
          bolt={previousWeekTotals.bolt}
          uber={previousWeekTotals.uber}
          onClose={closeDriverWeeklyPopup}
        />
      )}

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 shrink-0 flex-col justify-between border-r border-[#E8B858]/20 bg-[#050505] p-5 lg:flex">
        <div>
          <button
            onClick={() => setDriverTab("home")}
            className="mb-6 text-left"
          >
            <h1 className="text-5xl font-black italic leading-none">Safe</h1>
            <p className="text-base font-bold italic text-[#F0C060]">
              Auto-House
            </p>
          </button>

          <div className="mb-5">
            <button className="w-full rounded-xl bg-[#E8B858] px-4 py-3 text-left text-base font-bold text-black">
              {role === "driver" ? "Οδηγός" : "Διαχειριστής"}
            </button>
          </div>

          {role === "driver" ? (
            <div className="space-y-2">
              <SidebarItem
                text="🏠 Αρχική"
                active={driverTab === "home"}
                onClick={() => setDriverTab("home")}
              />
              <SidebarItem
                text="📊 Επισκόπηση"
                active={driverTab === "overview"}
                onClick={() => setDriverTab("overview")}
              />
              <SidebarItem
                text="💶 Ημερήσια έσοδα"
                active={driverTab === "daily"}
                onClick={() => setDriverTab("daily")}
              />
              <SidebarItem
                text="📋 Έξοδα"
                active={driverTab === "expenses"}
                onClick={() => setDriverTab("expenses")}
              />
              <SidebarItem
                text="🕓 Ιστορικό"
                active={driverTab === "history"}
                onClick={() => setDriverTab("history")}
              />
              <SidebarItem
                text="🔔 Ενημερώσεις"
                active={driverTab === "updates"}
                onClick={() => setDriverTab("updates")}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <SidebarItem
                text="👥 Οδηγοί"
                active={adminTab === "drivers"}
                onClick={() => setAdminTab("drivers")}
              />
              <SidebarItem
                text="💰 Κέρδη"
                active={adminTab === "profits"}
                onClick={() => setAdminTab("profits")}
              />
              <SidebarItem
                text="📈 Τζίρος"
                active={adminTab === "turnover"}
                onClick={() => setAdminTab("turnover")}
              />
              <SidebarItem
                text="⚙️ Σταθερές"
                active={adminTab === "expenses"}
                onClick={() => setAdminTab("expenses")}
              />
              <SidebarItem
                text="🚕 Δόσεις από πωλήσεις"
                active={adminTab === "sales-installments"}
                onClick={() => setAdminTab("sales-installments")}
              />
              <SidebarItem
                text="📢 Ανακοινώσεις"
                active={adminTab === "updates"}
                onClick={() => setAdminTab("updates")}
              />
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={logout}
            className="w-full rounded-xl border border-[#E8B858] px-4 py-3 text-base font-bold text-[#F0C060] transition hover:bg-[#E8B858] hover:text-black"
          >
            Αποσύνδεση
          </button>

          {role === "driver" && (
            <button
              onClick={() => setDriverTab("settings")}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                driverTab === "settings"
                  ? "border-[#E8B858] bg-[#E8B858] text-black"
                  : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E8B858] bg-black text-lg font-black text-[#F0C060]">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt="Ρυθμίσεις οδηγού"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "?"
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold">
                  {driverDisplayName}
                </span>
                <span
                  className={`block text-sm ${
                    driverTab === "settings" ? "text-black/70" : "text-zinc-400"
                  }`}
                >
                  Ρυθμίσεις προφίλ
                </span>
              </span>
            </button>
          )}
        </div>
      </aside>

      <MobileTopBar
        role={role}
        title={role === "driver" ? driverDisplayName : "Διαχειριστής"}
        onLogout={logout}
        onMenuClick={() => setShowMobileMenu(true)}
        onProfileClick={() => setDriverTab("settings")}
      />

      <MobileSideMenu
        open={showMobileMenu}
        role={role}
        driverTab={driverTab}
        adminTab={adminTab}
        onClose={() => setShowMobileMenu(false)}
        onDriverTab={(tab) => {
          setDriverTab(tab);
          setShowMobileMenu(false);
        }}
        onAdminTab={(tab) => {
          setAdminTab(tab);
          setShowMobileMenu(false);
        }}
        onLogout={logout}
        onProfileClick={() => {
          setDriverTab("settings");
          setShowMobileMenu(false);
        }}
      />

      <section className="mx-auto w-full max-w-5xl overflow-x-hidden px-4 pb-8 pt-20 sm:px-6 lg:px-6 lg:py-6 xl:px-10 xl:py-8">
        {role === "driver" && driverTab === "home" && (
          <>
            <Header title="Αρχική" subtitle="Ενημερώσεις Safe Auto-House" />
            <div className="space-y-3">
              {updates.map((update, index) => (
                <PostCard
                  key={index}
                  post={update}
                  label="Γενική ανακοίνωση"
                />
              ))}
            </div>
          </>
        )}

        {role === "driver" && driverTab === "overview" && (
          <>
            <Header
              title="Επισκόπηση οδηγού"
              subtitle="Συνολική εικόνα εβδομάδας"
            />
            <Stats
              totalIncome={weekTotals.income}
              totalExpenses={weekTotals.expenses}
              netIncome={weekTotals.net}
            />

            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Panel title="Αναλυτικά έξοδα">
                <Row label="Ενοίκιο" value={`- €${weekTotals.rent.toFixed(2)}`} />
                <Row
                  label="Ένσημο"
                  value={`- €${weekTotals.insurance.toFixed(2)}`}
                />
                <Row
                  label={vehicleType === "electric" ? "Ηλεκτρικό" : "Καύσιμο"}
                  value={`- €${weekTotals.fuelOrElectric.toFixed(2)}`}
                />
                <Row label="Διόδια" value={`- €${weekTotals.tolls.toFixed(2)}`} />
                <Row label="ΦΠΑ από Ζ" value={`- €${weekTotals.vat.toFixed(2)}`} />
                <Row
                  label="Φόρος εφαρμογών"
                  value={`- €${weekTotals.appTax.toFixed(2)}`}
                />
                <div className="flex justify-between border-t border-zinc-700 pt-3 text-base font-black">
                  <span>Σύνολο</span>
                  <span className="text-[#F0C060]">
                    €{weekTotals.net.toFixed(2)}
                  </span>
                </div>
              </Panel>

              <Panel title="Ποσοστά εσόδων">
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

        {role === "driver" && driverTab === "daily" && (
          <>
            <Header title="Ημερήσια έσοδα" subtitle="Πάτησε ημέρα και βάλε ποσά" />
            <DaySelector
              days={days}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
            />

            <Panel title={`Καταχώρηση για ${selectedDayLabel}`}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="FreeNow"
                  value={selected.freenow}
                  onChange={(v) => updateDay("freenow", v)}
                />
                <Input
                  label="Bolt"
                  value={selected.bolt}
                  onChange={(v) => updateDay("bolt", v)}
                />
                <Input
                  label="Uber"
                  value={selected.uber}
                  onChange={(v) => updateDay("uber", v)}
                />
                <Input
                  label="Δρόμος"
                  value={selected.street}
                  onChange={(v) => updateDay("street", v)}
                />
                <Input
                  label="Ζ Ταμειακής"
                  value={selected.zReport}
                  onChange={(v) => updateDay("zReport", v)}
                />
                {vehicleType === "electric" ? (
                  <Input
                    label="Χλμ ηλεκτρικού"
                    value={selected.electricKm}
                    onChange={(v) => updateDay("electricKm", v)}
                  />
                ) : (
                  <Input
                    label="Καύσιμο ημέρας"
                    value={selected.fuelCost}
                    onChange={(v) => updateDay("fuelCost", v)}
                  />
                )}
              </div>

              <button
                onClick={() => updateDay("saved", true)}
                className="w-full rounded-xl bg-[#E8B858] py-3 text-base font-bold text-black hover:bg-[#F0C060]"
              >
                Αποθήκευση ημέρας
              </button>

              <Panel title={`Σύνοψη ${selectedDayLabel}`}>
                <Row
                  label="Σύνολο εσόδων"
                  value={`€${selectedCalc.totalIncome.toFixed(2)}`}
                />
                <Row
                  label="Σύνολο εξόδων"
                  value={`- €${selectedCalc.totalExpenses.toFixed(2)}`}
                />
                <Row
                  label="Καθαρό ημέρας"
                  value={`€${selectedCalc.netIncome.toFixed(2)}`}
                />
              </Panel>
            </Panel>
          </>
        )}

        {role === "driver" && driverTab === "expenses" && (
          <>
            <Header title="Ημερήσια έξοδα" subtitle="Σταθερά έξοδα που έχει ορίσει ο διαχειριστής" />
            <SettingsRows settings={settings} vehicleType={vehicleType} />
          </>
        )}

        {role === "driver" && driverTab === "history" && (
          <>
            <Header title="Ιστορικό" subtitle="Μήνας, εβδομάδα και ημέρα" />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <Panel title="Μήνες">
                {historyMonths.map((month, index) => (
                  <HistoryButton
                    key={month.name}
                    label={month.name}
                    net={month.net}
                    active={selectedHistoryMonth === index}
                    onClick={() => {
                      setSelectedHistoryMonth(index);
                      setSelectedHistoryWeek(null);
                    }}
                  />
                ))}
              </Panel>

              <Panel title={`Εβδομάδες για ${activeMonth.name}`}>
                {activeMonth.weeks.map((week, index) => (
                  <HistoryButton
                    key={week.label}
                    label={week.label}
                    net={week.net}
                    active={selectedHistoryWeek === index}
                    onClick={() => setSelectedHistoryWeek(index)}
                  />
                ))}
              </Panel>

              <Panel title={activeWeek ? `Ημέρες εβδομάδας ${activeWeek.label}` : "Ημέρες"}>
                {!activeWeek && (
                  <p className="text-base text-zinc-400">
                    Πάτησε μια εβδομάδα για να δεις τις ημέρες της.
                  </p>
                )}
                {activeWeek?.days.map((day) => (
                  <div
                    key={day.name}
                    className={`flex justify-between rounded-xl border p-4 text-base ${
                      day.net >= 0
                        ? "border-green-500/30 bg-green-500/10"
                        : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <span className="font-bold">{day.name}</span>
                    <span className={day.net >= 0 ? "text-green-400" : "text-red-400"}>
                      {day.net >= 0 ? "+" : "-"}€{Math.abs(day.net)}
                    </span>
                  </div>
                ))}
              </Panel>
            </div>
          </>
        )}

        {role === "driver" && driverTab === "updates" && (
          <>
            <Header
              title="Ενημερώσεις"
              subtitle="Προσωπικά μηνύματα από τον διαχειριστή"
            />
            <div className="space-y-3">
              <DriverWeeklySummaryCard
                weekRange={formatWeekRange(previousWeekKey)}
                net={previousWeekTotals.net}
                performance={previousWeekPerformance}
                bestApp={previousWeekBestApp}
                freenow={previousWeekTotals.freenow}
                bolt={previousWeekTotals.bolt}
                uber={previousWeekTotals.uber}
              />

              {(personalMessages[activeDriverId] ?? []).length === 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-base text-zinc-400">
                  Δεν υπάρχει προσωπικό μήνυμα αυτή τη στιγμή.
                </div>
              )}

              {(personalMessages[activeDriverId] ?? []).map((post, index) => (
                <PostCard
                  key={index}
                  post={post}
                  label="Προσωπική ενημέρωση"
                />
              ))}
            </div>
          </>
        )}

        {role === "driver" && driverTab === "settings" && (
          <>
            <Header
              title="Ρυθμίσεις οδηγού"
              subtitle="Προσωπικά στοιχεία, έγγραφα και εφαρμογές"
            />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_1fr]">
              <div className="flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-2 border-[#E8B858] bg-black text-6xl shadow-[0_0_28px_rgba(232,184,88,0.22)]">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt="Ρυθμίσεις οδηγού"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "?"
                  )}
                </div>
                <label className="mt-4 w-full cursor-pointer rounded-xl bg-[#E8B858] py-3 text-center text-base font-bold text-black">
                  Ανέβασμα φωτογραφίας
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="mt-3 text-center text-sm text-zinc-400">
                  Οι μέρες εργασίας ενημερώνονται αυτόματα.
                </p>
              </div>

              <div className="space-y-3">
                <ProfileAccordion title="1. Προσωπικά στοιχεία" subtitle="Όνομα, επίθετο και ηλικία">
                  <FormGrid>
                    <InputText label="Όνομα" value={profile.firstName} onChange={(v) => setProfile({ ...profile, firstName: v })} />
                    <InputText label="Επίθετο" value={profile.lastName} onChange={(v) => setProfile({ ...profile, lastName: v })} />
                    <Input label="Ηλικία" value={profile.age} onChange={(v) => setProfile({ ...profile, age: v })} />
                  </FormGrid>
                  <Row label="Συνολικές μέρες εργασίας" value={`${weekTotals.workedDays}`} />
                  <SaveButton />
                </ProfileAccordion>

                <ProfileAccordion title="2. Έγγραφα οδηγού" subtitle="ΑΤ, δίπλωμα, ειδική άδεια, ΑΦΜ">
                  <FormGrid>
                    <InputText label="ΑΤ" value={profile.identityNumber} onChange={(v) => setProfile({ ...profile, identityNumber: v })} />
                    <InputText label="Αριθμός διπλώματος" value={profile.licenseNumber} onChange={(v) => setProfile({ ...profile, licenseNumber: v })} />
                    <InputText label="Ειδική άδεια" value={profile.specialLicense} onChange={(v) => setProfile({ ...profile, specialLicense: v })} />
                    <InputText label="ΑΦΜ" value={profile.taxNumber} onChange={(v) => setProfile({ ...profile, taxNumber: v })} />
                  </FormGrid>
                  <SaveButton />
                </ProfileAccordion>

                <ProfileAccordion title="3. Κωδικοί εφαρμογών" subtitle="FreeNow, Bolt, Uber">
                  <FormGrid>
                    <InputText label="FreeNow Email" value={profile.freeNowEmail} onChange={(v) => setProfile({ ...profile, freeNowEmail: v })} />
                    <InputText label="FreeNow Κωδικός" value={profile.freeNowPassword} onChange={(v) => setProfile({ ...profile, freeNowPassword: v })} password />
                    <InputText label="Bolt Email" value={profile.boltEmail} onChange={(v) => setProfile({ ...profile, boltEmail: v })} />
                    <InputText label="Bolt Κωδικός" value={profile.boltPassword} onChange={(v) => setProfile({ ...profile, boltPassword: v })} password />
                    <InputText label="Uber Email" value={profile.uberEmail} onChange={(v) => setProfile({ ...profile, uberEmail: v })} />
                    <InputText label="Uber Κωδικός" value={profile.uberPassword} onChange={(v) => setProfile({ ...profile, uberPassword: v })} password />
                  </FormGrid>
                  <SaveButton />
                </ProfileAccordion>
              </div>
            </div>
          </>
        )}

        {role === "admin" && adminTab === "drivers" && (
          <>
            <Header title="Οδηγοί" subtitle="Λίστα οδηγών και αναλυτικά οικονομικά στοιχεία" />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
              <div className="space-y-4">
                <Panel title="Αιτήματα εγγραφής οδηγών">
                  {registrationRequests.length === 0 && (
                    <p className="rounded-xl border border-zinc-800 bg-black p-4 text-zinc-400">
                      Δεν υπάρχουν νέα αιτήματα.
                    </p>
                  )}

                  {registrationRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-xl border border-[#E8B858]/30 bg-[#E8B858]/10 p-4"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <Row
                          label="Οδηγός"
                          value={`${request.firstName} ${request.lastName}`}
                        />
                        <Row label="Email" value={request.email} />
                        <Row label="Τηλέφωνο" value={request.phone} />
                        <Row label="ΑΦΜ admin" value={request.adminTaxNumber} />
                      </div>
                      <p className="mt-3 text-sm text-zinc-400">
                        Συνδέεται με {request.adminEmail} ·{" "}
                        {new Date(request.createdAt).toLocaleString("el-GR")}
                      </p>
                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <button
                          onClick={() => approveRegistrationRequest(request)}
                          className="rounded-xl bg-[#E8B858] py-3 font-bold text-black hover:bg-[#F0C060]"
                        >
                          Αποδοχή
                        </button>
                        <button
                          onClick={() => deleteRegistrationRequest(request.id)}
                          className="rounded-xl border border-red-500/40 py-3 font-bold text-red-300 hover:bg-red-500/10"
                        >
                          Διαγραφή
                        </button>
                      </div>
                    </div>
                  ))}
                </Panel>

                <Panel title="Import εφαρμογών">
                  <ImportButton
                    label="Import FreeNow"
                    onChange={(event) => importAppExcel("FreeNow", event)}
                  />
                  <ImportButton
                    label="Import Uber"
                    onChange={(event) => importAppExcel("Uber", event)}
                  />
                  <ImportButton
                    label="Import Bolt"
                    onChange={(event) => importAppExcel("Bolt", event)}
                  />
                  {excelImportMessage && (
                    <p className="rounded-xl border border-[#E8B858]/30 bg-[#E8B858]/10 p-3 text-sm text-[#F9E3AA]">
                      {excelImportMessage}
                    </p>
                  )}
                </Panel>

              <Panel title="Search οδηγού">
                <input
                  type="search"
                  value={driverSearch}
                  onChange={(event) => setDriverSearch(event.target.value)}
                  placeholder="Αναζήτηση οδηγού..."
                  className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-base outline-none focus:border-[#E8B858]"
                />

                {visibleAdminDrivers.length === 0 && (
                  <p className="rounded-xl border border-zinc-800 bg-black p-4 text-zinc-400">
                    Δεν βρέθηκε οδηγός.
                  </p>
                )}

                {visibleAdminDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`rounded-xl border transition ${
                      selectedAdminDriverId === driver.id
                        ? "border-[#E8B858] bg-[#E8B858] text-black"
                        : "border-zinc-800 bg-black hover:bg-zinc-800"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedAdminDriverId(driver.id);
                        setSelectedAdminMonth(3);
                        setSelectedAdminWeek(null);
                        setSelectedAdminDayKey(null);
                      }}
                      className="w-full p-4 text-left"
                    >
                      <span className="block font-bold">{driver.name}</span>
                      <span
                        className={`mt-1 block text-sm ${
                          selectedAdminDriverId === driver.id
                            ? "text-black/70"
                            : "text-zinc-400"
                        }`}
                      >
                        {driver.plate} ·{" "}
                        {driver.vehicleType === "electric" ? "Ηλεκτρικό" : "Καύσιμο"}
                      </span>
                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          driver.status === "active"
                            ? selectedAdminDriverId === driver.id
                              ? "bg-black/10 text-black"
                              : "bg-green-500/10 text-green-400"
                            : driver.status === "frozen"
                              ? selectedAdminDriverId === driver.id
                                ? "bg-black/10 text-black"
                                : "bg-[#E8B858]/10 text-[#F0C060]"
                              : selectedAdminDriverId === driver.id
                                ? "bg-black/10 text-black"
                                : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {getDriverStatusLabel(driver.status)}
                      </span>
                    </button>
                  </div>
                ))}
              </Panel>
              </div>

              <div className="space-y-4">
                <Panel title={`Στοιχεία οδηγού - ${selectedAdminDriver.name}`}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DriverInfoItem label="Όνομα" value={selectedAdminDriver.name} />
                    <DriverInfoItem label="Τηλέφωνο" value={selectedAdminDriver.phone} />
                    <DriverInfoItem label="Email" value={selectedAdminDriver.email} />
                    <DriverInfoItem label="Πινακίδα" value={selectedAdminDriver.plate} />
                    <DriverInfoItem
                      label="Κατάσταση"
                      value={getDriverStatusLabel(selectedAdminDriver.status)}
                    />
                    <DriverInfoItem
                      label="Όχημα"
                      value={
                        selectedAdminDriver.vehicleType === "electric"
                          ? "Ηλεκτρικό"
                          : "Καύσιμο"
                      }
                    />
                  </div>
                  <div className="mt-5 border-t border-zinc-800 pt-5">
                    <p className="mb-4 text-sm font-black uppercase tracking-wide text-[#F0C060]">
                      Πρόσβαση οδηγού στην εφαρμογή
                    </p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <button
                        onClick={() =>
                          updateDriverStatus(selectedAdminDriver.id, "active")
                        }
                        className={
                          selectedAdminDriver.status === "active"
                            ? activeButton
                            : normalButton
                        }
                      >
                        Ενεργός
                      </button>
                      <button
                        onClick={() =>
                          updateDriverStatus(selectedAdminDriver.id, "frozen")
                        }
                        className={
                          selectedAdminDriver.status === "frozen"
                            ? activeButton
                            : normalButton
                        }
                      >
                        Πάγωμα
                      </button>
                      <button
                        onClick={() =>
                          updateDriverStatus(selectedAdminDriver.id, "fired")
                        }
                        className={
                          selectedAdminDriver.status === "fired"
                            ? activeButton
                            : normalButton
                        }
                      >
                        Απόλυση
                      </button>
                    </div>
                    {selectedAdminDriver.status !== "active" && (
                      <p className="mt-3 rounded-xl border border-[#E8B858]/30 bg-[#E8B858]/10 p-3 text-sm text-[#F6D486]">
                        Η είσοδος του οδηγού είναι μπλοκαρισμένη μέχρι να τον
                        επαναφέρεις σε ενεργό.
                      </p>
                    )}
                  </div>
                </Panel>

                <Panel title="Έξοδα οδηγού (μόνο διαχειριστής)">
                  <FormGrid>
                    <Input
                      label="Ενοίκιο ημέρας"
                      value={selectedAdminSettings.rentPerDay}
                      onChange={(v) =>
                        updateAdminDriverSetting(
                          selectedAdminDriver.id,
                          "rentPerDay",
                          v
                        )
                      }
                    />
                    <Input
                      label="Ένσημο ημέρας"
                      value={selectedAdminSettings.insurancePerDay}
                      onChange={(v) =>
                        updateAdminDriverSetting(
                          selectedAdminDriver.id,
                          "insurancePerDay",
                          v
                        )
                      }
                    />
                    <Input
                      label="Διόδια ημέρας"
                      value={selectedAdminSettings.tollsPerDay}
                      onChange={(v) =>
                        updateAdminDriverSetting(
                          selectedAdminDriver.id,
                          "tollsPerDay",
                          v
                        )
                      }
                    />
                    <Input
                      label="ΦΠΑ %"
                      value={selectedAdminSettings.vatPercent}
                      onChange={(v) =>
                        updateAdminDriverSetting(
                          selectedAdminDriver.id,
                          "vatPercent",
                          v
                        )
                      }
                    />
                    <Input
                      label="Φόρος εφαρμογών %"
                      value={selectedAdminSettings.appTaxPercent}
                      onChange={(v) =>
                        updateAdminDriverSetting(
                          selectedAdminDriver.id,
                          "appTaxPercent",
                          v
                        )
                      }
                    />
                    <Input
                      label="Τιμή ανά χλμ ηλεκτρικού"
                      value={selectedAdminSettings.electricPricePerKm}
                      onChange={(v) =>
                        updateAdminDriverSetting(
                          selectedAdminDriver.id,
                          "electricPricePerKm",
                          v
                        )
                      }
                    />
                  </FormGrid>
                </Panel>

                <Panel title="Τζίρος οδηγού">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="min-w-0 rounded-xl border border-zinc-800 bg-black p-4">
                      <h3 className="font-black text-red-400">FreeNow</h3>
                      <TurnoverRow
                        label="Κάρτες"
                        value={`€${selectedAdminTurnover.freenowCard.toFixed(2)}`}
                      />
                      <TurnoverRow
                        label="Μετρητά"
                        value={`€${selectedAdminTurnover.freenowCash.toFixed(2)}`}
                      />
                    </div>
                    <div className="min-w-0 rounded-xl border border-zinc-800 bg-black p-4">
                      <h3 className="font-black text-zinc-300">Uber</h3>
                      <TurnoverRow
                        label="Κάρτες"
                        value={`€${selectedAdminTurnover.uberCard.toFixed(2)}`}
                      />
                      <TurnoverRow
                        label="Μετρητά"
                        value={`€${selectedAdminTurnover.uberCash.toFixed(2)}`}
                      />
                    </div>
                    <div className="min-w-0 rounded-xl border border-zinc-800 bg-black p-4">
                      <h3 className="font-black text-green-400">Bolt</h3>
                      <TurnoverRow
                        label="Κάρτες"
                        value={`€${selectedAdminTurnover.boltCard.toFixed(2)}`}
                      />
                      <TurnoverRow
                        label="Μετρητά"
                        value={`€${selectedAdminTurnover.boltCash.toFixed(2)}`}
                      />
                    </div>
                  </div>
                </Panel>

                <Panel title="Υπόλοιπο οδηγού">
                  <div
                    className={`rounded-xl border p-4 ${
                      selectedAdminWeeklyBalance >= 0
                        ? "border-[#E8B858]/30 bg-[#E8B858]/10"
                        : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <p className="text-sm font-bold text-zinc-400">
                      Τρέχουσα εβδομάδα {formatWeekRange(currentWeekKey)}
                    </p>
                    <p
                      className={`mt-2 text-2xl font-black ${
                        selectedAdminWeeklyBalance >= 0
                          ? "text-[#F0C060]"
                          : "text-red-400"
                      }`}
                    >
                      €{Math.abs(selectedAdminWeeklyBalance).toFixed(2)}
                    </p>
                    <p className="mt-2 font-bold">
                      {selectedAdminWeeklyBalance >= 0
                        ? "Ο οδηγός οφείλει στην εταιρεία"
                        : "Η εταιρεία οφείλει στον οδηγό"}
                    </p>
                  </div>
                </Panel>

                <Panel title="Συνολικά κέρδη ανά μήνα">
                  <div className="space-y-4">
                    {adminHistoryMonths.map((month, monthIndex) => {
                      const monthOpen = selectedAdminMonth === monthIndex;

                      return (
                        <div
                          key={month.name}
                          className={`rounded-xl border ${
                            monthOpen
                              ? "border-[#E8B858] bg-[#E8B858]/10"
                              : "border-zinc-800 bg-black"
                          }`}
                        >
                          <button
                            onClick={() => {
                              setSelectedAdminMonth(monthIndex);
                              setSelectedAdminWeek(null);
                              setSelectedAdminDayKey(null);
                            }}
                            className="flex w-full items-center justify-between gap-4 p-5 text-left"
                          >
                            <span>
                              <span className="block text-xl font-black">
                                {month.name}
                              </span>
                              <span className="mt-1 block text-sm text-zinc-400">
                                Σύνολο καθαρού μήνα
                              </span>
                            </span>
                            <span
                              className={`text-xl font-black ${
                                month.net >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {month.net >= 0 ? "+" : "-"}€
                              {Math.abs(month.net).toFixed(2)}
                            </span>
                          </button>

                          {monthOpen && (
                            <div className="space-y-3 border-t border-zinc-800 p-4">
                              {month.weeks.map((week, weekIndex) => {
                                const weekOpen = selectedAdminWeek === weekIndex;

                                return (
                                  <div
                                    key={week.label}
                                    className={`rounded-xl border ${
                                      weekOpen
                                        ? "border-[#E8B858] bg-zinc-950"
                                        : "border-zinc-800 bg-zinc-900"
                                    }`}
                                  >
                                    <button
                                      onClick={() => {
                                        setSelectedAdminWeek(weekIndex);
                                        setSelectedAdminDayKey(null);
                                      }}
                                      className="flex w-full items-center justify-between gap-4 p-4 text-left"
                                    >
                                      <span>
                                        <span className="block font-bold">
                                          Εβδομάδα {week.label}
                                        </span>
                                        <span className="mt-1 block text-sm text-zinc-400">
                                          {week.sourceDays.length} ημέρες
                                        </span>
                                      </span>
                                      <span
                                        className={
                                          week.net >= 0
                                            ? "font-bold text-green-400"
                                            : "font-bold text-red-400"
                                        }
                                      >
                                        {week.net >= 0 ? "+" : "-"}€
                                        {Math.abs(week.net).toFixed(2)}
                                      </span>
                                    </button>

                                    {weekOpen && (
                                      <div className="grid grid-cols-1 gap-3 border-t border-zinc-800 p-4 md:grid-cols-2">
                                        {week.sourceDays.length === 0 && (
                                          <p className="text-zinc-400">
                                            Δεν υπάρχουν ημέρες σε αυτή την εβδομάδα.
                                          </p>
                                        )}
                                        {week.sourceDays.map((day) => {
                                          const dayCalc = calculateCompanyRevenueFromDriver(
                                            day,
                                            selectedAdminSettings
                                          );

                                          return (
                                            <button
                                              key={day.dateKey}
                                              onClick={() =>
                                                setSelectedAdminDayKey(day.dateKey)
                                              }
                                              className={`rounded-xl border p-4 text-left transition ${
                                                selectedAdminDayKey === day.dateKey
                                                  ? "border-[#E8B858] bg-[#E8B858] text-black"
                                                  : "border-zinc-800 bg-black hover:bg-zinc-800"
                                              }`}
                                            >
                                              <span className="block font-bold">
                                                {day.label} {day.date}
                                              </span>
                                              <span className="mt-2 flex justify-between gap-3">
                                                <span
                                                  className={
                                                    selectedAdminDayKey === day.dateKey
                                                      ? "text-black/70"
                                                      : "text-zinc-400"
                                                  }
                                                >
                                                  Καθαρό ημέρας
                                                </span>
                                                <span className="font-black">
                                                  €{dayCalc.netIncome.toFixed(2)}
                                                </span>
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Panel>

                {activeAdminDay && activeAdminDayCalc && activeAdminCompanyRevenue && (
                  <Panel title={`Ανάλυση ημέρας - ${activeAdminDay.label} ${activeAdminDay.date}`}>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      <div>
                        <h3 className="mb-3 font-black text-[#F0C060]">
                          Έσοδα εταιρείας από οδηγό
                        </h3>
                        <Row label="Ενοίκιο" value={`€${activeAdminCompanyRevenue.rent.toFixed(2)}`} />
                        <Row label="ΦΠΑ από Ζ" value={`€${activeAdminCompanyRevenue.vatAmount.toFixed(2)}`} />
                        <Row label="Ένσημο" value={`€${activeAdminCompanyRevenue.insurance.toFixed(2)}`} />
                        <Row label="12% εφαρμογών" value={`€${activeAdminCompanyRevenue.appTaxAmount.toFixed(2)}`} />
                        <Row label="Σύνολο εταιρείας" value={`€${activeAdminCompanyRevenue.netIncome.toFixed(2)}`} />
                      </div>
                      <div>
                        <h3 className="mb-3 font-black text-[#F0C060]">
                          Πηγή υπολογισμού
                        </h3>
                        <Row label="FreeNow" value={`€${activeAdminDay.freenow.toFixed(2)}`} />
                        <Row label="Bolt" value={`€${activeAdminDay.bolt.toFixed(2)}`} />
                        <Row label="Uber" value={`€${activeAdminDay.uber.toFixed(2)}`} />
                        <Row label="Σύνολο εφαρμογών" value={`€${activeAdminCompanyRevenue.appIncome.toFixed(2)}`} />
                        <Row label="Ζ Ταμειακής" value={`€${activeAdminDay.zReport.toFixed(2)}`} />
                      </div>
                    </div>
                  </Panel>
                )}
              </div>
            </div>
          </>
        )}

        {role === "admin" && adminTab === "expenses" && (
          <>
            <Header title="Σταθερές" subtitle="Ρυθμίσεις διαχειριστή" />
            <Panel title="Σταθερές">
              <FormGrid>
                <Input label="ΦΠΑ %" value={settings.vatPercent} onChange={(v) => setSettings({ ...settings, vatPercent: v })} />
                <Input label="Φόρος εφαρμογών %" value={settings.appTaxPercent} onChange={(v) => setSettings({ ...settings, appTaxPercent: v })} />
                <Input label="Τιμή ανά χλμ" value={settings.electricPricePerKm} onChange={(v) => setSettings({ ...settings, electricPricePerKm: v })} />
              </FormGrid>
            </Panel>
          </>
        )}

        {role === "admin" && adminTab === "updates" && (
          <>
            <Header
              title="Ανακοινώσεις"
              subtitle="Γενικά posts αρχικής και προσωπικά μηνύματα οδηγών"
            />
            <div className="space-y-4">
              <Panel title="Δημοσίευση στην αρχική">
                <textarea
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  placeholder="Γράψε θέμα που θα φαίνεται στην αρχική όλων των οδηγών..."
                  className="min-h-28 w-full rounded-xl border border-zinc-800 bg-black p-4 text-base outline-none focus:border-[#E8B858]"
                />

                <PostImagePicker
                  imageUrl={newUpdateImage}
                  onImageChange={(event) =>
                    handlePostImageUpload(event, setNewUpdateImage)
                  }
                  onRemove={() => setNewUpdateImage("")}
                />

                <button
                  onClick={publishUpdate}
                  className="w-full rounded-xl bg-[#E8B858] py-3 text-base font-bold text-black"
                >
                  Δημοσίευση στην αρχική
                </button>
              </Panel>

              <Panel title="Δημοσίευση στις ενημερώσεις">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1 text-sm text-zinc-400">
                        Πινακίδα
                      </p>
                      <input
                        value={personalMessageDriverSearch}
                        onChange={(event) =>
                          setPersonalMessageDriverSearch(event.target.value)
                        }
                        placeholder="Όνομα, email, τηλέφωνο ή πινακίδα..."
                        className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-base outline-none focus:border-[#E8B858]"
                      />
                    </div>

                    <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                      {visiblePersonalMessageDrivers.map((driver) => (
                        <button
                          key={driver.id}
                          onClick={() => setSelectedAdminDriverId(driver.id)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            selectedAdminDriver.id === driver.id
                              ? "border-[#E8B858] bg-[#E8B858] text-black"
                              : "border-zinc-800 bg-black hover:bg-zinc-800"
                          }`}
                        >
                          <span className="block font-black">{driver.name}</span>
                          <span
                            className={`block text-sm ${
                              selectedAdminDriver.id === driver.id
                                ? "text-black/70"
                                : "text-zinc-400"
                            }`}
                          >
                            {driver.plate} · {driver.email}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#E8B858]/30 bg-[#E8B858]/10 p-3">
                      <p className="text-sm font-bold text-[#F6D486]">
                        Παραλήπτης
                      </p>
                      <p className="text-lg font-black">{selectedAdminDriver.name}</p>
                    </div>

                    <textarea
                      value={newPersonalMessage}
                      onChange={(e) => setNewPersonalMessage(e.target.value)}
                      placeholder="Γράψε προσωπικό post μόνο για αυτόν τον οδηγό..."
                      className="min-h-28 w-full rounded-xl border border-zinc-800 bg-black p-4 text-base outline-none focus:border-[#E8B858]"
                    />

                    <PostImagePicker
                      imageUrl={newPersonalMessageImage}
                      onImageChange={(event) =>
                        handlePostImageUpload(event, setNewPersonalMessageImage)
                      }
                      onRemove={() => setNewPersonalMessageImage("")}
                    />

                    <button
                      onClick={sendPersonalMessage}
                      className="w-full rounded-xl bg-[#E8B858] py-3 text-base font-bold text-black"
                    >
                      Δημοσίευση στις ενημερώσεις
                    </button>

                    <div className="border-t border-zinc-800 pt-4">
                      <p className="mb-3 text-sm font-bold text-zinc-400">
                        Posts προς {selectedAdminDriver.name}
                      </p>
                      <div className="space-y-3">
                        {(personalMessages[selectedAdminDriver.id] ?? []).map(
                          (post, index) => (
                            <PostCard
                              key={index}
                              post={post}
                              label="Προσωπική ενημέρωση"
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </>
        )}

        {role === "admin" && adminTab === "sales-installments" && (
          <>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <Header
                title="Δόσεις από πωλήσεις"
                subtitle="Παρακολούθηση πληρωμών και υπολοίπων από πωλήσεις"
              />
              <button
                onClick={() => {
                  setSalesInstallmentForm({
                    id: "",
                    plate: "",
                    price: 0,
                    vehicleType: "",
                    totalPrice: 0,
                    monthlyPrice: 0,
                    totalInstallments: 0,
                    paidInstallments: 0,
                    lastPaidMonth: "",
                    taxiLicenseMonthlyInstallment: 0,
                    ownerName: "",
                    carModel: "",
                  });
                  setShowSalesInstallmentForm(true);
                }}
                className="rounded-xl bg-[#E8B858] px-5 py-3 font-bold text-black hover:bg-[#F0C060]"
              >
                Προσθήκη
              </button>
            </div>

            {showSalesInstallmentForm && (
              <Panel
                title={
                  salesInstallmentForm.id
                    ? "Επεξεργασία δόσης οχήματος"
                    : "Νέα δόση οχήματος"
                }
              >
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <div className="space-y-4">
                    <InputText
                      label="Πινακίδα"
                      value={salesInstallmentForm.plate}
                      onChange={(v) =>
                        setSalesInstallmentForm({
                          ...salesInstallmentForm,
                          plate: v,
                        })
                      }
                    />
                    <InputText
                      label="Μοντέλο αυτοκινήτου"
                      value={salesInstallmentForm.carModel}
                      onChange={(v) =>
                        setSalesInstallmentForm({
                          ...salesInstallmentForm,
                          carModel: v,
                        })
                      }
                    />
                    <InputText
                      label="Τύπος οχήματος"
                      value={salesInstallmentForm.vehicleType}
                      onChange={(v) =>
                        setSalesInstallmentForm({
                          ...salesInstallmentForm,
                          vehicleType: v,
                        })
                      }
                    />
                    <InputText
                      label="Όνομα ιδιοκτήτη"
                      value={salesInstallmentForm.ownerName}
                      onChange={(v) =>
                        setSalesInstallmentForm({
                          ...salesInstallmentForm,
                          ownerName: v,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-4 rounded-xl border border-[#E8B858]/20 bg-black p-4">
                    <Input
                      label="Τιμή"
                      value={salesInstallmentForm.price}
                      onChange={(v) =>
                        setSalesInstallmentForm({
                          ...salesInstallmentForm,
                          price: v,
                        })
                      }
                    />
                    <Input
                      label="Τιμή συνολική"
                      value={salesInstallmentForm.totalPrice}
                      onChange={(v) =>
                        setSalesInstallmentForm({
                          ...salesInstallmentForm,
                          totalPrice: v,
                        })
                      }
                    />
                    <Input
                      label="Τιμή ανά μήνα"
                      value={salesInstallmentForm.monthlyPrice}
                      onChange={(v) =>
                        setSalesInstallmentForm({
                          ...salesInstallmentForm,
                          monthlyPrice: v,
                        })
                      }
                    />
                    <Input
                      label="Συνολικές δόσεις"
                      value={salesInstallmentForm.totalInstallments}
                      onChange={(v) =>
                        setSalesInstallmentForm({
                          ...salesInstallmentForm,
                          totalInstallments: v,
                        })
                      }
                    />
                    <Input
                      label="Πληρωμένες δόσεις"
                      value={salesInstallmentForm.paidInstallments}
                      onChange={(v) =>
                        setSalesInstallmentForm({
                          ...salesInstallmentForm,
                          paidInstallments: v,
                        })
                      }
                    />
                    <div>
                      <p className="mb-1 text-sm text-zinc-400">
                        Τελευταίος πληρωμένος μήνας
                      </p>
                      <input
                        type="month"
                        value={salesInstallmentForm.lastPaidMonth}
                        onChange={(event) =>
                          setSalesInstallmentForm({
                            ...salesInstallmentForm,
                            lastPaidMonth: event.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-base outline-none focus:border-[#E8B858]"
                      />
                    </div>
                    <Input
                      label="Δόση άδειας ταξί κάθε μήνα"
                      value={salesInstallmentForm.taxiLicenseMonthlyInstallment}
                      onChange={(v) =>
                        setSalesInstallmentForm({
                          ...salesInstallmentForm,
                          taxiLicenseMonthlyInstallment: v,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <button
                    onClick={saveSalesInstallment}
                    className="rounded-xl bg-[#E8B858] py-3 font-bold text-black hover:bg-[#F0C060]"
                  >
                    Αποθήκευση
                  </button>
                  <button
                    onClick={() => setShowSalesInstallmentForm(false)}
                    className={normalButton}
                  >
                    Κλείσιμο
                  </button>
                </div>
              </Panel>
            )}

            <Panel title="Λίστα οχημάτων">
              {salesInstallments.length === 0 && (
                <p className="text-zinc-400">
                  Δεν έχει προστεθεί ακόμα δόση από πώληση.
                </p>
              )}

              <div className="space-y-3">
                {salesInstallments.map((installment) => {
                  const monthsLeft = Math.max(
                    installment.totalInstallments - installment.paidInstallments,
                    0
                  );
                  const currentMonth = getMonthInputValue(new Date());
                  const overdue =
                    new Date().getDate() > 15 &&
                    installment.lastPaidMonth !== currentMonth &&
                    monthsLeft > 0;
                  const overdueAmount =
                    installment.monthlyPrice +
                    installment.taxiLicenseMonthlyInstallment;

                  return (
                    <button
                      key={installment.id}
                      onClick={() => editSalesInstallment(installment)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        overdue
                          ? "border-red-500/50 bg-red-500/10"
                          : "border-zinc-800 bg-black hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-black text-[#F0C060]">
                            {installment.plate || "-"}
                          </h3>
                          <p className="truncate text-zinc-400">
                            {installment.carModel || "-"}
                          </p>
                        </div>
                        <p className="shrink-0 text-right text-2xl font-black text-[#F0C060]">
                          €{installment.totalPrice.toFixed(2)}
                        </p>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            markSalesInstallmentPaid(installment.id);
                          }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8B858] text-2xl font-black text-black hover:bg-[#F0C060]"
                          title="Πληρώθηκε ο μήνας"
                        >
                          +
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 border-t border-zinc-800 pt-3 md:grid-cols-3">
                        <span className="text-sm text-zinc-400">
                          Μένουν{" "}
                          <strong className="text-white">{monthsLeft}</strong>{" "}
                          μήνες
                        </span>
                        <span className="text-sm text-zinc-400">
                          Πληρωμένες {installment.paidInstallments}/
                          {installment.totalInstallments}
                        </span>
                        <span
                          className={`text-sm font-black ${
                            overdue ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {overdue
                            ? `-${overdueAmount.toFixed(2)}€ καθυστέρηση`
                            : "Πληρωμένο"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Panel>
          </>
        )}

        {role === "admin" && adminTab === "profits" && (
          <>
            <Header
              title="Κέρδη"
              subtitle={`Εβδομαδιαία έσοδα εφαρμογών ${formatWeekRange(selectedProfitWeekKey)}`}
            />

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
                <Panel title="Ποσοστά εφαρμογών">
                  <AppProfitPie
                    freenow={currentProfitWeek.freenow}
                    bolt={currentProfitWeek.bolt}
                    uber={currentProfitWeek.uber}
                  />
                </Panel>

                <Panel title="Εβδομαδιαία έσοδα εφαρμογών">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => moveProfitWeek(-1)}
                      className={normalButton}
                    >
                      Προηγούμενη εβδομάδα
                    </button>
                    <button
                      onClick={() => setSelectedProfitWeekKey(currentWeekKey)}
                      className={normalButton}
                    >
                      Τρέχουσα εβδομάδα
                    </button>
                    <button
                      onClick={() => moveProfitWeek(1)}
                      className={normalButton}
                    >
                      Επόμενη εβδομάδα
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      label="FreeNow"
                      value={currentProfitWeek.freenow}
                      onChange={(v) => updateWeeklyAppProfit("freenow", v)}
                    />
                    <Input
                      label="Bolt"
                      value={currentProfitWeek.bolt}
                      onChange={(v) => updateWeeklyAppProfit("bolt", v)}
                    />
                    <Input
                      label="Uber"
                      value={currentProfitWeek.uber}
                      onChange={(v) => updateWeeklyAppProfit("uber", v)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 border-t border-zinc-800 pt-4 lg:grid-cols-[1fr_260px]">
                    <div className="space-y-3">
                      <ProfitSummaryRow
                        label="Σύνολο εφαρμογών"
                        value={`€${appProfitTotal.toFixed(2)}`}
                      />
                      <ProfitSummaryRow
                        label="Καθαρό μετά το 12%"
                        value={`€${appProfitAfterTax.toFixed(2)}`}
                      />
                    </div>
                    <div className="rounded-xl border border-[#E8B858]/30 bg-[#E8B858]/10 p-4">
                      <p className="text-sm font-bold text-[#F6D486]">
                        Προμήθεια εφαρμογών
                      </p>
                      <p className="mt-2 text-3xl font-black text-[#F0C060]">
                        €{appProfitTax.toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm font-bold text-zinc-400">
                        (12%)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={saveSelectedProfitWeek}
                    className="w-full rounded-xl bg-[#E8B858] py-3 text-base font-bold text-black hover:bg-[#F0C060]"
                  >
                    {currentProfitWeek.savedAt
                      ? "Ενημέρωση αποθηκευμένης εβδομάδας"
                      : "Αποθήκευση εβδομάδας στα κέρδη"}
                  </button>

                  {currentProfitWeek.savedAt && (
                    <p className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                      Η εβδομάδα έχει αποθηκευτεί στα κέρδη. Τελευταία αποθήκευση:{" "}
                      {new Date(currentProfitWeek.savedAt).toLocaleString("el-GR")}
                    </p>
                  )}
                </Panel>
              </div>

              <Panel title="Συνολικά έσοδα εβδομάδας">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                  <div className="min-h-36 rounded-xl border border-zinc-800 bg-black p-5">
                    <p className="text-sm font-bold text-zinc-400">
                      Ενοίκια οδηγών
                    </p>
                    <p className="mt-3 break-words text-3xl font-black text-[#F0C060]">
                      €{selectedProfitDriverCollections.rent.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {selectedProfitDriverCollections.workedDays} δουλεμένες ημέρες
                    </p>
                  </div>

                  <div className="min-h-36 rounded-xl border border-zinc-800 bg-black p-5">
                    <p className="text-sm font-bold text-zinc-400">
                      ΦΠΑ από Ζ
                    </p>
                    <p className="mt-3 break-words text-3xl font-black text-[#F0C060]">
                      €{selectedProfitDriverCollections.vat.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Από Ζ των οδηγών
                    </p>
                  </div>

                  <div className="min-h-36 rounded-xl border border-[#E8B858]/30 bg-[#E8B858]/10 p-5">
                    <p className="text-sm font-bold text-[#F6D486]">
                      Σύνολο εσόδων
                    </p>
                    <p className="mt-3 break-words text-4xl font-black text-[#F0C060]">
                      €{selectedProfitGrandTotal.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">
                      Ενοίκια + ΦΠΑ + 12% εφαρμογών
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <Row
                    label="Σύνολο ενοικίων"
                    value={`€${selectedProfitDriverCollections.rent.toFixed(2)}`}
                  />
                  <Row
                    label="Σύνολο ΦΠΑ"
                    value={`€${selectedProfitDriverCollections.vat.toFixed(2)}`}
                  />
                  <Row
                    label="12% εφαρμογών"
                    value={`€${appProfitTax.toFixed(2)}`}
                  />
                  <Row
                    label="Σύνολο εσόδων εβδομάδας"
                    value={`€${selectedProfitGrandTotal.toFixed(2)}`}
                  />
                </div>
              </Panel>

              <Panel title="Αρχείο κερδών εφαρμογών">
                {savedProfitWeeks.length === 0 && (
                  <p className="text-zinc-400">
                    Δεν έχει αποθηκευτεί ακόμα εβδομάδα.
                  </p>
                )}

                {savedProfitWeeks.map(([weekKey, week]) => {
                  const weekTotal = week.freenow + week.bolt + week.uber;
                  const weekTax = weekTotal * 0.12;
                  const driverCollections =
                    calculateWeeklyDriverCollections(weekKey);
                  const driverTotal =
                    driverCollections.rent + driverCollections.vat;
                  const fullWeekTotal = driverTotal + weekTax;

                  return (
                    <button
                      key={weekKey}
                      onClick={() => setSelectedProfitWeekKey(weekKey)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedProfitWeekKey === weekKey
                          ? "border-[#E8B858] bg-[#E8B858] text-black"
                          : "border-zinc-800 bg-black hover:bg-zinc-800"
                      }`}
                    >
                      <span className="block font-bold">
                        {formatWeekRange(weekKey)}
                      </span>
                      <span
                        className={`mt-2 block text-sm ${
                          selectedProfitWeekKey === weekKey
                            ? "text-black/70"
                            : "text-zinc-400"
                        }`}
                      >
                        Εφαρμογές €{weekTotal.toFixed(2)} · 12% €
                        {weekTax.toFixed(2)}
                      </span>
                      <span
                        className={`mt-1 block text-sm ${
                          selectedProfitWeekKey === weekKey
                            ? "text-black/70"
                            : "text-zinc-400"
                        }`}
                      >
                        Ενοίκια €{driverCollections.rent.toFixed(2)} · ΦΠΑ €
                        {driverCollections.vat.toFixed(2)}
                      </span>
                      <span className="mt-2 block text-xl font-black">
                        Σύνολο €{fullWeekTotal.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </Panel>
            </div>
          </>
        )}

        {role === "admin" && adminTab === "turnover" && (
          <>
            <Header
              title="Τζίρος"
              subtitle="Προβολή εβδομαδιαίου τζίρου για το τρέχον έτος"
            />

            <div className="space-y-4">
              <Panel title={`Εβδομάδα ${formatWeekRange(selectedTurnoverWeekKey)}`}>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => moveTurnoverWeek(-1)}
                    className={normalButton}
                  >
                    Προηγούμενη εβδομάδα
                  </button>
                  <button
                    onClick={() => setSelectedTurnoverWeekKey(currentWeekKey)}
                    className={normalButton}
                  >
                    Τρέχουσα εβδομάδα
                  </button>
                  <button
                    onClick={() => moveTurnoverWeek(1)}
                    className={normalButton}
                  >
                    Επόμενη εβδομάδα
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-zinc-800 bg-black p-4">
                    <p className="text-sm font-bold text-zinc-400">
                      Ενοίκια
                    </p>
                    <p className="mt-2 text-2xl font-black text-[#F0C060]">
                      €{selectedTurnoverCollections.rent.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {selectedTurnoverCollections.workedDays} δουλεμένες ημέρες
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-black p-4">
                    <p className="text-sm font-bold text-zinc-400">
                      ΦΠΑ από Ζ
                    </p>
                    <p className="mt-2 text-2xl font-black text-[#F0C060]">
                      €{selectedTurnoverCollections.vat.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Από Ζ των οδηγών
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-black p-4">
                    <p className="text-sm font-bold text-zinc-400">
                      12% εφαρμογών
                    </p>
                    <p className="mt-2 text-2xl font-black text-[#F0C060]">
                      €{selectedTurnoverAppTax.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Από FreeNow, Bolt, Uber
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E8B858]/30 bg-[#E8B858]/10 p-4">
                    <p className="text-sm font-bold text-[#F6D486]">
                      Σύνολο εβδομάδας
                    </p>
                    <p className="mt-2 text-3xl font-black text-[#F0C060]">
                      €{selectedTurnoverTotal.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">
                      Ενοίκια + ΦΠΑ + 12% εφαρμογών
                    </p>
                  </div>
                </div>

                <p
                  className={`rounded-xl border p-3 text-sm ${
                    savedTurnoverRecord
                      ? "border-green-500/30 bg-green-500/10 text-green-300"
                      : "border-[#E8B858]/30 bg-[#E8B858]/10 text-[#F6D486]"
                  }`}
                >
                  {savedTurnoverRecord
                    ? `Η εβδομάδα υπάρχει στον τζίρο επειδή έχει αποθηκευτεί στα κέρδη. Τελευταία αποθήκευση: ${new Date(savedTurnoverRecord.savedAt).toLocaleString("el-GR")}`
                    : "Αυτή η εβδομάδα δεν έχει αποθηκευτεί στα κέρδη, άρα δεν μπαίνει ακόμα στον τζίρο."}
                </p>
              </Panel>

              <Panel title={`Ημερολόγιο τζίρου ${new Date().getFullYear()}`}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {turnoverMonths.map((month) => (
                    <div
                      key={month.name}
                      className="rounded-xl border border-zinc-800 bg-black p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{month.name}</p>
                          <p className="mt-1 text-sm text-zinc-400">
                            {month.records.length} αποθηκευμένες εβδομάδες
                          </p>
                        </div>
                        <p className="text-xl font-black text-[#F0C060]">
                          €{month.total.toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-3 space-y-2">
                        {month.records.length === 0 && (
                          <p className="text-sm text-zinc-500">
                            Δεν υπάρχουν εγγραφές.
                          </p>
                        )}
                        {month.records.map((record) => (
                          <button
                            key={record.weekKey}
                            onClick={() =>
                              setSelectedTurnoverWeekKey(record.weekKey)
                            }
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                              selectedTurnoverWeekKey === record.weekKey
                                ? "border-[#E8B858] bg-[#E8B858] text-black"
                                : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                            }`}
                          >
                            <span className="block font-bold">
                              {formatWeekRange(record.weekKey)}
                            </span>
                            <span
                              className={
                                selectedTurnoverWeekKey === record.weekKey
                                  ? "text-black/70"
                                  : "text-zinc-400"
                              }
                            >
                              €{record.total.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <Panel title="Συνολικός τζίρος ανά τετράμηνο">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {turnoverFourMonthGroups.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-xl border border-zinc-800 bg-black p-4"
                  >
                    <p className="font-black text-[#F0C060]">{group.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {group.months}
                    </p>
                    <p className="mt-4 text-3xl font-black">
                      €{group.total.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}
      </section>
    </main>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
      <p className="mt-2 text-base text-zinc-400">{subtitle}</p>
    </div>
  );
}

function MobileTopBar({
  role,
  title,
  onLogout,
  onMenuClick,
  onProfileClick,
}: {
  role: Role;
  title: string;
  onLogout: () => void;
  onMenuClick: () => void;
  onProfileClick: () => void;
}) {
  return (
    <div className="fixed inset-x-0 top-0 z-30 border-b border-[#E8B858]/20 bg-[#050505]/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Άνοιγμα μενού"
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-[#E8B858]/40 bg-black"
          >
            <span className="h-0.5 w-5 rounded-full bg-[#F0C060]" />
            <span className="h-0.5 w-5 rounded-full bg-[#F0C060]" />
            <span className="h-0.5 w-5 rounded-full bg-[#F0C060]" />
          </button>
          <button
            onClick={role === "driver" ? onProfileClick : undefined}
            className="min-w-0 text-left"
          >
            <p className="text-xl font-black italic leading-none">Safe</p>
            <p className="truncate text-sm font-bold text-[#F0C060]">
              {title}
            </p>
          </button>
        </div>
        <button
          onClick={onLogout}
          className="shrink-0 rounded-xl border border-[#E8B858] px-3 py-2 text-sm font-bold text-[#F0C060]"
        >
          Έξοδος
        </button>
      </div>
    </div>
  );
}

function MobileSideMenu({
  open,
  role,
  driverTab,
  adminTab,
  onClose,
  onDriverTab,
  onAdminTab,
  onLogout,
  onProfileClick,
}: {
  open: boolean;
  role: Role;
  driverTab: string;
  adminTab: string;
  onClose: () => void;
  onDriverTab: (tab: string) => void;
  onAdminTab: (tab: string) => void;
  onLogout: () => void;
  onProfileClick: () => void;
}) {
  const driverItems = [
    ["home", "🏠 Αρχική"],
    ["overview", "📊 Επισκόπηση"],
    ["daily", "💶 Έσοδα"],
    ["expenses", "📋 Έξοδα"],
    ["history", "🕓 Ιστορικό"],
    ["updates", "🔔 Ενημερώσεις"],
  ];
  const adminItems = [
    ["drivers", "👥 Οδηγοί"],
    ["profits", "💰 Κέρδη"],
    ["turnover", "📈 Τζίρος"],
    ["expenses", "⚙️ Σταθερές"],
    ["sales-installments", "🚕 Δόσεις από πωλήσεις"],
    ["updates", "📢 Ανακοινώσεις"],
  ];
  const items = role === "driver" ? driverItems : adminItems;

  return (
    <div
      className={`fixed inset-0 z-40 lg:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <button
        onClick={onClose}
        aria-label="Κλείσιμο μενού"
        className={`absolute inset-0 bg-black/70 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <nav
        className={`absolute inset-y-0 left-0 flex w-72 max-w-[82vw] flex-col justify-between border-r border-[#E8B858]/20 bg-[#050505] p-5 shadow-2xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="mb-8 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-5xl font-black italic leading-none">Safe</h1>
              <p className="text-base font-bold italic text-[#F0C060]">
                Auto-House
              </p>
              <p className="mt-3 rounded-xl bg-[#E8B858] px-3 py-2 text-sm font-black text-black">
                {role === "driver" ? "Οδηγός" : "Διαχειριστής"}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Κλείσιμο μενού"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 text-xl font-black text-[#F0C060]"
            >
              X
            </button>
          </div>

          <div className="space-y-2">
        {items.map(([tab, label]) => {
          const active = role === "driver" ? driverTab === tab : adminTab === tab;

          return (
            <button
              key={tab}
              onClick={() =>
                role === "driver" ? onDriverTab(tab) : onAdminTab(tab)
              }
              className={`w-full rounded-xl px-4 py-3 text-left text-base font-bold ${
                active
                  ? "bg-[#E8B858] text-black"
                  : "border border-zinc-800 bg-zinc-900 text-zinc-300"
              }`}
            >
              {label}
            </button>
          );
        })}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {role === "driver" && (
            <button
              onClick={onProfileClick}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left font-bold text-zinc-200"
            >
              Ρυθμίσεις οδηγού
            </button>
          )}
          <button
            onClick={onLogout}
            className="w-full rounded-xl border border-[#E8B858] px-4 py-3 font-bold text-[#F0C060]"
          >
            Αποσύνδεση
          </button>
        </div>
      </nav>
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
      className={`w-full rounded-xl px-4 py-3 text-left text-base transition ${
        active
          ? "bg-[#E8B858] font-bold text-black"
          : "border border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
      }`}
    >
      {text}
    </button>
  );
}

function ImportButton({
  label,
  onChange,
}: {
  label: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block cursor-pointer rounded-xl bg-[#E8B858] px-4 py-3 text-center font-bold text-black hover:bg-[#F0C060]">
      {label}
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="border-b border-[#E8B858]/20 p-3">
        <h2 className="text-lg font-black text-[#F0C060] sm:text-xl">{title}</h2>
      </div>
      <div className="space-y-4 p-3 sm:p-4">{children}</div>
    </div>
  );
}

function PostCard({
  post,
  label,
}: {
  post: AnnouncementPost;
  label: string;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={label}
          className="max-h-[420px] w-full object-cover"
        />
      )}
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-bold text-[#F0C060]">{label}</span>
          <span className="text-xs text-zinc-500">
            {new Date(post.createdAt).toLocaleString("el-GR")}
          </span>
        </div>
        {post.message && (
          <p className="whitespace-pre-wrap break-words text-base text-white">
            {post.message}
          </p>
        )}
      </div>
    </article>
  );
}

function PostImagePicker({
  imageUrl,
  onImageChange,
  onRemove,
}: {
  imageUrl: string;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-zinc-400">Φωτογραφία post</p>
        <div className="flex gap-2">
          <label className="cursor-pointer rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800">
            Ανέβασμα
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
          </label>
          {imageUrl && (
            <button
              onClick={onRemove}
              className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10"
            >
              Αφαίρεση
            </button>
          )}
        </div>
      </div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Φωτογραφία post"
          className="mt-3 max-h-80 w-full rounded-xl object-cover"
        />
      )}
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
      <p className="mb-1 text-sm text-zinc-400">{label}</p>
      <input
        type="number"
        value={value === 0 ? "" : value}
        placeholder="Εδώ γράφεται"
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-base outline-none focus:border-[#E8B858]"
      />
    </div>
  );
}

function InputText({
  label,
  value,
  onChange,
  password,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  password?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-sm text-zinc-400">{label}</p>
      <input
        type={password ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-base outline-none focus:border-[#E8B858]"
      />
    </div>
  );
}

function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function Stats({
  totalIncome,
  totalExpenses,
  netIncome,
}: {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Stat title="Συνολικά έσοδα" value={`€${totalIncome.toFixed(2)}`} />
      <Stat title="Συνολικά έξοδα" value={`€${totalExpenses.toFixed(2)}`} />
      <Stat title="Καθαρό κέρδος" value={`€${netIncome.toFixed(2)}`} orange />
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
      <p className="text-sm text-zinc-400">{title}</p>
      <h2 className={`mt-2 break-words text-xl font-black sm:text-2xl ${orange ? "text-[#F0C060]" : ""}`}>
        {value}
      </h2>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const highlighted =
    label.includes("Σύνολο") ||
    label.includes("Καθαρό") ||
    label.includes("Τζίρος") ||
    label.includes("Υπόλοιπο");

  return (
    <div
      className={`grid grid-cols-1 gap-1 py-2 text-left text-base sm:grid-cols-[minmax(150px,220px)_1fr] sm:gap-4 ${
        highlighted ? "border-t border-[#E8B858]/30 pt-3 font-black" : ""
      }`}
    >
      <span className={`min-w-0 ${highlighted ? "text-[#F0C060]" : "text-zinc-400"}`}>
        {label}
      </span>
      <span
        className={`min-w-0 break-words text-left ${
          highlighted ? "font-black text-[#F0C060]" : "font-bold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function DriverInfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-zinc-800 bg-black p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 break-words text-base font-black leading-snug text-white">
        {value || "-"}
      </p>
    </div>
  );
}

function ProfitSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-t border-[#E8B858]/30 pt-3">
      <p className="break-words text-base font-black leading-snug text-[#F0C060] sm:text-lg">
        {label}
      </p>
      <p className="mt-2 break-words text-2xl font-black leading-tight text-[#F0C060] sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

function TurnoverRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 grid min-w-0 grid-cols-[76px_minmax(0,1fr)] gap-2 text-sm">
      <span className="min-w-0 text-zinc-400">{label}</span>
      <span className="min-w-0 break-words text-left font-black leading-snug text-white">
        {value}
      </span>
    </div>
  );
}

function SettingsRows({
  settings,
  vehicleType,
}: {
  settings: {
    rentPerDay: number;
    insurancePerDay: number;
    tollsPerDay: number;
    vatPercent: number;
    appTaxPercent: number;
    electricPricePerKm: number;
  };
  vehicleType: VehicleType;
}) {
  return (
    <Panel title="Ημερήσιες σταθερές">
      <Row label="Ενοίκιο ημέρας" value={`€${settings.rentPerDay}`} />
      <Row label="Ένσημο ημέρας" value={`€${settings.insurancePerDay}`} />
      <Row label="Διόδια ημέρας" value={`€${settings.tollsPerDay}`} />
      <Row label="ΦΠΑ %" value={`${settings.vatPercent}%`} />
      <Row label="Φόρος εφαρμογών %" value={`${settings.appTaxPercent}%`} />
      <Row
        label={vehicleType === "electric" ? "Τιμή ανά χλμ ηλεκτρικού" : "Καύσιμο"}
        value={
          vehicleType === "electric"
            ? `€${settings.electricPricePerKm}`
            : "Με καταχώρηση οδηγού"
        }
      />
    </Panel>
  );
}

function calculateDayFinancials(
  d: DayData,
  settings: ExpenseSettings,
  vehicleType: VehicleType
) {
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

function calculateCompanyRevenueFromDriver(
  d: DayData,
  settings: ExpenseSettings
) {
  const appIncome = d.freenow + d.bolt + d.uber;
  const rent = d.saved ? settings.rentPerDay : 0;
  const insurance = d.saved ? settings.insurancePerDay : 0;
  const vatAmount = (d.zReport * settings.vatPercent) / 100;
  const appTaxAmount = appIncome * 0.12;
  const netIncome = rent + insurance + vatAmount + appTaxAmount;

  return {
    appIncome,
    rent,
    insurance,
    vatAmount,
    appTaxAmount,
    netIncome,
  };
}

function calculateOfficialDriverBalance(
  row: OfficialDriverWeek,
  settings: ExpenseSettings
) {
  const normalizedRow = normalizeOfficialDriverWeek(row);
  const appTax = normalizedRow.appTurnover * 0.12;
  const rent = normalizedRow.workedDays * settings.rentPerDay;
  const insurance = normalizedRow.workedDays * settings.insurancePerDay;
  const totalCharges = appTax + rent + insurance + normalizedRow.vat;
  const balance = normalizedRow.cardPayments - totalCharges;

  return {
    appTax,
    rent,
    insurance,
    vat: normalizedRow.vat,
    totalCharges,
    balance,
  };
}

function normalizeOfficialDriverWeek(
  row: Partial<OfficialDriverWeek> | null | undefined
): OfficialDriverWeek {
  return {
    ...emptyOfficialDriverWeek(),
    ...(row ?? {}),
  };
}

function emptyOfficialDriverWeek(): OfficialDriverWeek {
  return {
    appTurnover: 0,
    cardPayments: 0,
    freenowCard: 0,
    freenowCash: 0,
    uberCard: 0,
    uberCash: 0,
    boltCard: 0,
    boltCash: 0,
    workedDays: 0,
    vat: 0,
  };
}

function findDriverFromExcelRow(
  row: Record<string, unknown>,
  drivers: Array<{ id: string; name: string; email: string; plate: string }>
) {
  const name = normalizeExcelText(
    String(
      getExcelValue(row, [
        "Όνομα",
        "ονοματεπώνυμο",
        "οδηγός",
        "driver",
        "name",
      ]) ?? ""
    )
  );
  const email = normalizeExcelText(
    String(getExcelValue(row, ["email", "mail", "e-mail"]) ?? "")
  );
  const plate = normalizeExcelText(
    String(getExcelValue(row, ["πινακίδα", "plate", "license plate"]) ?? "")
  );

  return drivers.find((driver) => {
    const driverName = normalizeExcelText(driver.name);
    const driverEmail = normalizeExcelText(driver.email);
    const driverPlate = normalizeExcelText(driver.plate);

    return (
      (name && (driverName.includes(name) || name.includes(driverName))) ||
      (email && driverEmail === email) ||
      (plate && driverPlate === plate)
    );
  });
}

function getExcelNumber(row: Record<string, unknown>, aliases: string[]) {
  const value = getExcelValue(row, aliases);
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const normalizedValue = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getExcelValue(row: Record<string, unknown>, aliases: string[]) {
  const normalizedAliases = aliases.map(normalizeExcelText);
  const foundKey = Object.keys(row).find((key) =>
    normalizedAliases.includes(normalizeExcelText(key))
  );

  return foundKey ? row[foundKey] : undefined;
}

function normalizeExcelText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ς/g, "σ")
    .replace(/[^a-z0-9α-ω]/g, "");
}

function getDriverStatusLabel(status: DriverStatus) {
  if (status === "frozen") return "Πάγωμα";
  if (status === "fired") return "Απόλυση";
  return "Ενεργός";
}

function getBlockedLoginMessage(status: DriverStatus) {
  if (status === "fired") {
    return "Δυστυχώς ο διαχειριστής απέλυσε τον λογαριασμό σου. Θα χρειαστεί να επικοινωνήσεις μαζί του.";
  }

  return "Δυστυχώς ο διαχειριστής πάγωσε τον λογαριασμό σου. Θα χρειαστεί να επικοινωνήσεις μαζί του.";
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
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
      {dayKeys.map((key) => {
        const day = days[key];

        return (
        <button
          key={key}
          onClick={() => setSelectedDay(key)}
          className={`rounded-xl border p-4 text-left transition ${
            selectedDay === key
              ? "border-[#E8B858] bg-[#E8B858] text-black"
              : "border-zinc-800 bg-zinc-900"
          }`}
        >
          <p className="text-base font-bold">{day.short}</p>
          <p className="mt-1 text-sm">{day.date}</p>
          <p className="mt-2 text-sm">{day.saved ? "Αποθηκευμένη" : "Πρόχειρη"}</p>
        </button>
        );
      })}
    </div>
  );
}

function AppProfitPie({
  freenow,
  bolt,
  uber,
}: {
  freenow: number;
  bolt: number;
  uber: number;
}) {
  const total = freenow + bolt + uber;
  const boltPercent = total ? (bolt / total) * 100 : 0;
  const freenowPercent = total ? (freenow / total) * 100 : 0;
  const uberPercent = total ? (uber / total) * 100 : 0;
  const boltEnd = boltPercent;
  const freenowEnd = boltPercent + freenowPercent;

  const background =
    total > 0
      ? `conic-gradient(#34d186 0 ${boltEnd}%, #e30613 ${boltEnd}% ${freenowEnd}%, #8a8f98 ${freenowEnd}% 100%)`
      : "conic-gradient(#27272a 0 100%)";

  return (
    <div className="space-y-5">
      <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 p-5">
        <div
          className="flex h-full w-full items-center justify-center rounded-full"
          style={{ background }}
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-zinc-900 text-center">
            <span className="text-sm text-zinc-400">Σύνολο</span>
            <span className="text-xl font-black text-[#F0C060]">
              €{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <ProfitLegend
          color="bg-[#34d186]"
          label="Bolt"
          value={bolt}
          percent={boltPercent}
        />
        <ProfitLegend
          color="bg-[#e30613]"
          label="FreeNow"
          value={freenow}
          percent={freenowPercent}
        />
        <ProfitLegend
          color="bg-[#8a8f98]"
          label="Uber"
          value={uber}
          percent={uberPercent}
        />
      </div>
    </div>
  );
}

function DriverWeeklyPopup({
  weekRange,
  net,
  performance,
  bestApp,
  freenow,
  bolt,
  uber,
  onClose,
}: {
  weekRange: string;
  net: number;
  performance: string;
  bestApp: string | null;
  freenow: number;
  bolt: number;
  uber: number;
  onClose: () => void;
}) {
  const hasAppData = freenow + bolt + uber > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E8B858]/30 bg-zinc-950 p-5 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Κλείσιμο"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-black text-xl font-black text-[#F0C060] transition hover:border-[#E8B858] hover:bg-[#E8B858] hover:text-black"
        >
          X
        </button>

        <div className="pr-12">
          <p className="text-sm font-bold text-zinc-400">
            Προηγούμενη εβδομάδα {weekRange}
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Η προηγούμενη βδομάδα σου πήγε:
          </h2>
          <div className="mt-4 rounded-xl border border-[#E8B858]/30 bg-[#E8B858]/10 p-4">
            <p className="text-4xl font-black text-[#F0C060]">
              €{net.toFixed(2)}
            </p>
            <p className="mt-1 text-xl font-black text-white">
              {performance}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <AppProfitPie freenow={freenow} bolt={bolt} uber={uber} />
        </div>

        <div className="mt-5 rounded-xl border border-zinc-800 bg-black p-4">
          <p className="text-sm font-bold text-zinc-400">Συμβουλή</p>
          <p className="mt-2 text-lg font-bold text-white">
            {hasAppData && bestApp
              ? `Νομίζω ότι ${bestApp} είναι η εφαρμογή σου.`
              : "Μόλις περάσουν δεδομένα προηγούμενης εβδομάδας, θα σου δείχνω ποια εφαρμογή σε πλήρωσε καλύτερα."}
          </p>
        </div>
      </div>
    </div>
  );
}

function DriverWeeklySummaryCard({
  weekRange,
  net,
  performance,
  bestApp,
  freenow,
  bolt,
  uber,
}: {
  weekRange: string;
  net: number;
  performance: string;
  bestApp: string | null;
  freenow: number;
  bolt: number;
  uber: number;
}) {
  const hasAppData = freenow + bolt + uber > 0;

  return (
    <div className="rounded-xl border border-[#E8B858]/30 bg-zinc-900 p-4">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <div>
          <p className="text-sm font-bold text-zinc-400">
            Αναφορά προηγούμενης εβδομάδας {weekRange}
          </p>
          <h2 className="mt-2 text-xl font-black text-white">
            Η προηγούμενη βδομάδα σου πήγε:
          </h2>
          <div className="mt-4 rounded-xl border border-[#E8B858]/30 bg-[#E8B858]/10 p-4">
            <p className="break-words text-3xl font-black text-[#F0C060]">
              €{net.toFixed(2)}
            </p>
            <p className="mt-1 text-lg font-black text-white">{performance}</p>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
            <p className="text-sm font-bold text-zinc-400">Συμβουλή</p>
            <p className="mt-2 font-bold text-white">
              {hasAppData && bestApp
                ? `Νομίζω ότι ${bestApp} είναι η εφαρμογή σου.`
                : "Μόλις περάσουν δεδομένα προηγούμενης εβδομάδας, θα σου δείχνω ποια εφαρμογή σε πλήρωσε καλύτερα."}
            </p>
          </div>
        </div>

        <AppProfitPie freenow={freenow} bolt={bolt} uber={uber} />
      </div>
    </div>
  );
}

function ProfitLegend({
  color,
  label,
  value,
  percent,
}: {
  color: string;
  label: string;
  value: number;
  percent: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black p-3">
      <span className={`h-4 w-4 rounded-full ${color}`} />
      <span className="font-bold">{label}</span>
      <span className="ml-auto text-zinc-400">
        {percent.toFixed(0)}% · €{value.toFixed(2)}
      </span>
    </div>
  );
}

function getBestAppName(values: {
  freenow: number;
  bolt: number;
  uber: number;
}) {
  const apps = [
    { name: "FreeNow", value: values.freenow },
    { name: "Bolt", value: values.bolt },
    { name: "Uber", value: values.uber },
  ].sort((a, b) => b.value - a.value);

  return apps[0].value > 0 ? apps[0].name : null;
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
  const p = (v: number) => (total ? ((v / total) * 100).toFixed(0) : "0");

  return (
    <div className="space-y-3 text-base">
      <Legend color="bg-red-500" label="FreeNow" value={`${p(freenow)}%`} />
      <Legend color="bg-green-500" label="Bolt" value={`${p(bolt)}%`} />
      <Legend color="bg-black border border-white" label="Uber" value={`${p(uber)}%`} />
      <Legend color="bg-white" label="Δρόμος" value={`${p(street)}%`} />
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
    <div className="flex items-center gap-3">
      <div className={`h-3 w-3 rounded-full ${color}`} />
      <span>{label}</span>
      <span className="ml-auto font-bold">{value}</span>
    </div>
  );
}

function HistoryButton({
  label,
  net,
  active,
  onClick,
}: {
  label: string;
  net: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full justify-between rounded-xl p-4 text-base ${
        active ? "bg-[#E8B858] text-black" : "border border-zinc-800 bg-black"
      }`}
    >
      <span className="font-bold">{label}</span>
      <span className={net >= 0 && !active ? "text-green-400" : net < 0 && !active ? "text-red-400" : ""}>
        {net >= 0 ? "+" : "-"}€{Math.abs(net)}
      </span>
    </button>
  );
}

function buildHistoryMonths(
  allWeeks: Record<string, Record<DayKey, DayData>>,
  calculateDay: (day: DayData) => { netIncome: number }
) {
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
    const date = new Date(today.getFullYear(), today.getMonth() - 3 + i, 1);
    const weeks = Object.entries(allWeeks)
      .map(([weekKey, weekDays]) => {
        const days = dayKeys
          .map((key) => weekDays[key])
          .filter((day) => {
            const dayDate = parseDateKey(day.dateKey);
            return (
              dayDate.getFullYear() === date.getFullYear() &&
              dayDate.getMonth() === date.getMonth()
            );
          })
          .map((day) => ({
            name: `${day.label} ${day.date}`,
            net: calculateDay(day).netIncome,
          }));
        const sourceDays = dayKeys
          .map((key) => weekDays[key])
          .filter((day) => {
            const dayDate = parseDateKey(day.dateKey);
            return (
              dayDate.getFullYear() === date.getFullYear() &&
              dayDate.getMonth() === date.getMonth()
            );
          });

        return {
          label: formatWeekRange(weekKey),
          net: days.reduce((sum, day) => sum + day.net, 0),
          days,
          sourceDays,
        };
      })
      .filter((week) => week.days.length > 0)
      .sort((a, b) => a.label.localeCompare(b.label));

    return {
      name: monthNames[date.getMonth()],
      net: weeks.reduce((sum, week) => sum + week.net, 0),
      weeks:
        weeks.length > 0
          ? weeks
          : [
              {
                label: "Δεν υπάρχουν δεδομένα",
                net: 0,
                days: [],
                sourceDays: [],
              },
            ],
    };
  });
}

function createDemoDriverWeeks(seed: number) {
  const today = new Date();
  const weeks: Record<string, Record<DayKey, DayData>> = {};

  for (let weekOffset = 0; weekOffset < 12; weekOffset += 1) {
    const weekDate = addDays(today, -(weekOffset * 7));
    const weekKey = getWeekKey(weekDate);
    const weekDays = createWeekDays(weekDate);

    dayKeys.forEach((key, dayIndex) => {
      const base = 45 + seed * 18 + dayIndex * 7 + weekOffset * 2;
      weekDays[key] = {
        ...weekDays[key],
        freenow: dayIndex < 5 ? base : Math.round(base * 0.6),
        bolt: dayIndex % 2 === 0 ? Math.round(base * 0.55) : Math.round(base * 0.25),
        uber: dayIndex % 3 === 0 ? Math.round(base * 0.35) : Math.round(base * 0.18),
        street: dayIndex < 6 ? Math.round(base * 0.4) : 0,
        zReport: Math.round(base * 1.25),
        fuelCost: 18 + seed * 3 + dayIndex,
        electricKm: 80 + seed * 15 + dayIndex * 4,
        saved: dayIndex < 6,
      };
    });

    weeks[weekKey] = weekDays;
  }

  return weeks;
}

function createWeekDays(date: Date): Record<DayKey, DayData> {
  const weekStart = getWeekStart(date);

  return dayKeys.reduce((weekDays, key, index) => {
    const dayDate = addDays(weekStart, index);
    const { label, short } = greekWeekDays[key];

    return {
      ...weekDays,
      [key]: emptyDay(label, short, dayDate),
    };
  }, {} as Record<DayKey, DayData>);
}

function normalizeStoredWeeks(
  weeks: Record<string, Record<DayKey, DayData>>
) {
  return Object.fromEntries(
    Object.entries(weeks).map(([weekKey, weekDays]) => [
      weekKey,
      normalizeWeekDays(weekDays, parseDateKey(weekKey)),
    ])
  ) as Record<string, Record<DayKey, DayData>>;
}

function normalizeWeekDays(
  weekDays: Partial<Record<DayKey, DayData>>,
  weekDate: Date
): Record<DayKey, DayData> {
  const cleanWeek = createWeekDays(weekDate);

  dayKeys.forEach((key) => {
    const savedDay = weekDays[key];
    if (!savedDay) return;

    cleanWeek[key] = {
      ...cleanWeek[key],
      ...savedDay,
      label: greekWeekDays[key].label,
      short: greekWeekDays[key].short,
      date: cleanWeek[key].date,
      dateKey: cleanWeek[key].dateKey,
    };
  });

  return cleanWeek;
}

function getDayKey(date: Date): DayKey {
  const dayIndex = date.getDay();
  return dayKeys[dayIndex === 0 ? 6 : dayIndex - 1];
}

function getWeekKey(date: Date) {
  return getDateKey(getWeekStart(date));
}

function getWeekStart(date: Date) {
  const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = cleanDate.getDay();
  const diff = dayIndex === 0 ? -6 : 1 - dayIndex;
  cleanDate.setDate(cleanDate.getDate() + diff);
  return cleanDate;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatWeekRange(weekKey: string) {
  const weekStart = parseDateKey(weekKey);
  const weekEnd = addDays(weekStart, 6);
  return `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;
}

function buildTurnoverRecordsFromProfits(
  profits: Record<string, WeeklyAppRevenue>,
  calculateCollections: (weekKey: string) => {
    rent: number;
    vat: number;
    workedDays: number;
  }
) {
  const currentYear = new Date().getFullYear();

  return Object.fromEntries(
    Object.entries(profits)
      .filter(([, profit]) => profit.savedAt)
      .filter(([weekKey]) => {
      const weekDate = parseDateKey(weekKey);
      return weekDate.getFullYear() === currentYear;
      })
      .map(([weekKey, profit]) => {
        const collections = calculateCollections(weekKey);
        const appTotal = profit.freenow + profit.bolt + profit.uber;
        const appTax = appTotal * 0.12;

        return [
          weekKey,
          {
            weekKey,
            rent: collections.rent,
            vat: collections.vat,
            appTax,
            total: collections.rent + collections.vat + appTax,
            workedDays: collections.workedDays,
            savedAt: profit.savedAt ?? new Date().toISOString(),
          },
        ];
      })
  );
}

function buildTurnoverMonths(records: Record<string, WeeklyTurnoverRecord>) {
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
  const currentYear = new Date().getFullYear();
  const recordList = Object.values(records);

  return monthNames.map((name, monthIndex) => {
    const monthRecords = recordList
      .filter((record) => {
        const recordDate = parseDateKey(record.weekKey);
        return (
          recordDate.getFullYear() === currentYear &&
          recordDate.getMonth() === monthIndex
        );
      })
      .sort((a, b) => a.weekKey.localeCompare(b.weekKey));

    return {
      name,
      records: monthRecords,
      total: monthRecords.reduce((sum, record) => sum + record.total, 0),
    };
  });
}

function buildTurnoverFourMonthGroups(
  months: ReturnType<typeof buildTurnoverMonths>
) {
  const groups = [
    {
      title: "1ο τετράμηνο",
      months: "Ιανουάριος - Φεβρουάριος - Μάρτιος - Απρίλιος",
      indexes: [0, 1, 2, 3],
    },
    {
      title: "2ο τετράμηνο",
      months: "Μάιος - Ιούνιος - Ιούλιος - Αύγουστος",
      indexes: [4, 5, 6, 7],
    },
    {
      title: "3ο τετράμηνο",
      months: "Σεπτέμβριος - Οκτώβριος - Νοέμβριος - Δεκέμβριος",
      indexes: [8, 9, 10, 11],
    },
  ];

  return groups.map((group) => ({
    title: group.title,
    months: group.months,
    total: group.indexes.reduce(
      (sum, monthIndex) => sum + months[monthIndex].total,
      0
    ),
  }));
}

function buildDemoHistoryMonths() {
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
    const date = new Date(today.getFullYear(), today.getMonth() - 3 + i, 1);
    const weeks = [
      makeWeek("01-07", [80, 120, -30, 90, 60, 0, 0]),
      makeWeek("08-14", [100, -20, 140, 70, 30, 110, 0]),
      makeWeek("15-21", [-40, 90, 130, 50, 80, 0, 0]),
      makeWeek("22-31", [120, 160, -10, 70, 90, 40, 0]),
    ];

    return {
      name: monthNames[date.getMonth()],
      net: weeks.reduce((sum, week) => sum + week.net, 0),
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
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-3 text-left transition hover:bg-zinc-800"
      >
        <div>
          <h2 className="text-base font-black text-[#F0C060]">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>
        <span className="text-xl">{open ? "-" : "+"}</span>
      </button>

      {open && <div className="space-y-4 border-t border-zinc-800 p-4">{children}</div>}
    </div>
  );
}

function SaveButton() {
  const [saved, setSaved] = useState(false);

  return (
    <button
      onClick={() => setSaved(true)}
      className="w-full rounded-xl bg-[#E8B858] py-3 text-base font-bold text-black"
    >
      {saved ? "Αποθηκεύτηκε - Επεξεργασία" : "Αποθήκευση"}
    </button>
  );
}

