import { useMemo, useState } from "react";

const stateTaxes = {
  AZ: 0.056,
  CA: 0.0725,
  TX: 0.0625,
  FL: 0.06,
  NY: 0.04,
  NV: 0.0685,
  WA: 0.065,
  OR: 0.0,
};

export default function Home() {
  const [hourlyRate, setHourlyRate] = useState(150);
  const [incomeType, setIncomeType] = useState("percentage");
  const [shopPercentage, setShopPercentage] = useState(0.5);

  const [state, setState] = useState("AZ");
  const [email, setEmail] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [monthlyRent, setMonthlyRent] = useState(1500);
  const [supplies, setSupplies] = useState(800);
  const [insurance, setInsurance] = useState(300);
  const [misc, setMisc] = useState(200);
  const [desiredIncome, setDesiredIncome] = useState(6000);
  const [hoursPerWeek, setHoursPerWeek] = useState(30);
  const [weeksPerMonth, setWeeksPerMonth] = useState(4);
  const [bookingRate, setBookingRate] = useState(0.7);

  const results = useMemo(() => {
    const taxRate = stateTaxes[state] || 0;

    const availableHours = hoursPerWeek * weeksPerMonth * bookingRate;
    const grossMonthly = hourlyRate * availableHours;

    let afterShopIncome;

    if (incomeType === "percentage") {
      afterShopIncome = grossMonthly * (1 - shopPercentage);
    } else {
      afterShopIncome = grossMonthly - monthlyRent;
    }

    const afterExpenses = afterShopIncome - supplies - insurance - misc;
    const afterTax = afterExpenses * (1 - taxRate);

    const actualHourly =
      availableHours > 0 ? afterTax / availableHours : 0;

    const yearlyIncome = afterTax * 12;
    const targetYearly = desiredIncome * 12;

    const recommendedHourly =
      availableHours > 0
        ? (targetYearly / 12) / availableHours / (1 - taxRate)
        : 0;

    const underpricingAmount = recommendedHourly - hourlyRate;

    let score = 100;
    if (underpricingAmount > 0) score -= 40;
    if (bookingRate < 0.7) score -= 20;
    if (score < 0) score = 0;

    return {
      actualHourly,
      yearlyIncome,
      recommendedHourly,
      underpricingAmount,
      score,
    };
  }, [
    hourlyRate,
    incomeType,
    shopPercentage,
    monthlyRent,
    supplies,
    insurance,
    misc,
    desiredIncome,
    hoursPerWeek,
    weeksPerMonth,
    bookingRate,
    state,
  ]);

  return (
    <div style={styles.container}>
      
      {/* INPUT SECTION */}
      <div style={styles.card}>
        <h2>How You Get Paid</h2>

        <select
          value={incomeType}
          onChange={(e) => setIncomeType(e.target.value)}
          style={styles.input}
        >
          <option value="percentage">Shop Percentage</option>
          <option value="rental">Booth Rental</option>
        </select>

        <Input
          label="Your Hourly Rate"
          value={hourlyRate}
          setValue={setHourlyRate}
        />
      </div>

      {/* RESULTS */}
      {showResults && (
        <div style={styles.card}>
          <h2>Your Results</h2>

          <p>Your hourly rate: ${hourlyRate}</p>

          <p>
            Actual hourly:{" "}
            <strong>${results.actualHourly.toFixed(2)}</strong>
          </p>

          <p>
            Yearly income: ${results.yearlyIncome.toFixed(0)}
          </p>

          <p>
            Recommended hourly: $
            {results.recommendedHourly.toFixed(0)}
          </p>

          {results.underpricingAmount > 0 && (
            <div style={styles.warningBig}>
              ⚠️ Undercharging by $
              {results.underpricingAmount.toFixed(0)}/hr
            </div>
          )}

          <h3>Score: {results.score}/100</h3>
        </div>
      )}
    </div>
  );
}
