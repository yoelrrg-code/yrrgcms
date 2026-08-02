export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  countryCode: string;
}

const HOLIDAYS_BY_COUNTRY: Record<string, Holiday[]> = {
  CL: [
    { date: "2026-01-01", name: "Año Nuevo", countryCode: "CL" },
    { date: "2026-04-03", name: "Viernes Santo", countryCode: "CL" },
    { date: "2026-05-01", name: "Día del Trabajo", countryCode: "CL" },
    { date: "2026-05-21", name: "Día de las Glorias Navales", countryCode: "CL" },
    { date: "2026-09-18", name: "Fiestas Patrias", countryCode: "CL" },
    { date: "2026-09-19", name: "Día de las Glorias del Ejército", countryCode: "CL" },
    { date: "2026-12-25", name: "Navidad", countryCode: "CL" },
  ],
  MX: [
    { date: "2026-01-01", name: "Año Nuevo", countryCode: "MX" },
    { date: "2026-02-02", name: "Día de la Constitución", countryCode: "MX" },
    { date: "2026-03-16", name: "Natalicio de Benito Juárez", countryCode: "MX" },
    { date: "2026-05-01", name: "Día del Trabajo", countryCode: "MX" },
    { date: "2026-09-16", name: "Día de la Independencia", countryCode: "MX" },
    { date: "2026-11-16", name: "Revolución Mexicana", countryCode: "MX" },
    { date: "2026-12-25", name: "Navidad", countryCode: "MX" },
  ],
  US: [
    { date: "2026-01-01", name: "New Year's Day", countryCode: "US" },
    { date: "2026-01-19", name: "Martin Luther King Jr. Day", countryCode: "US" },
    { date: "2026-05-25", name: "Memorial Day", countryCode: "US" },
    { date: "2026-07-04", name: "Independence Day", countryCode: "US" },
    { date: "2026-09-07", name: "Labor Day", countryCode: "US" },
    { date: "2026-11-26", name: "Thanksgiving Day", countryCode: "US" },
    { date: "2026-12-25", name: "Christmas Day", countryCode: "US" },
  ],
  ES: [
    { date: "2026-01-01", name: "Año Nuevo", countryCode: "ES" },
    { date: "2026-01-06", name: "Epifanía del Señor", countryCode: "ES" },
    { date: "2026-04-03", name: "Viernes Santo", countryCode: "ES" },
    { date: "2026-05-01", name: "Fiesta del Trabajo", countryCode: "ES" },
    { date: "2026-08-15", name: "Asunción de la Virgen", countryCode: "ES" },
    { date: "2026-10-12", name: "Fiesta Nacional de España", countryCode: "ES" },
    { date: "2026-11-01", name: "Todos los Santos", countryCode: "ES" },
    { date: "2026-12-06", name: "Día de la Constitución", countryCode: "ES" },
    { date: "2026-12-25", name: "Natividad del Señor", countryCode: "ES" },
  ],
  UY: [
    { date: "2026-01-01", name: "Año Nuevo", countryCode: "UY" },
    { date: "2026-05-01", name: "Día del Trabajo", countryCode: "UY" },
    { date: "2026-07-18", name: "Jura de la Constitución", countryCode: "UY" },
    { date: "2026-08-25", name: "Declaratoria de la Independencia", countryCode: "UY" },
    { date: "2026-12-25", name: "Día de la Familia", countryCode: "UY" },
  ],
};

export function getHolidaysForCountries(countryCodes: string[]): Holiday[] {
  const list: Holiday[] = [];
  for (const code of countryCodes) {
    if (HOLIDAYS_BY_COUNTRY[code]) {
      list.push(...HOLIDAYS_BY_COUNTRY[code]);
    }
  }
  return list;
}

export function isHoliday(dateStr: string, countryCodes: string[]): boolean {
  const holidays = getHolidaysForCountries(countryCodes);
  return holidays.some((h) => h.date === dateStr);
}
