import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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

    let afterShopIncome =
      incomeType === "percentage"
        ? grossMonthly * (1 - shopPercentage)
        : grossMonthly - monthlyRent;

    const afterExpenses =
      afterShopIncome - supplies - insurance - misc;

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

  const handleSubmit = async () => {
    if (!email) {
      alert("Enter your email to continue");
      return;
    }

    try {
      const { error } = await supabase.from("leads").insert([
        {
          email: email.trim(),
          state,
          source: "Tattoo Pricing Tool",
        },
      ]);

      if (error) throw error;

      setShowResults(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Artist Protection Alliance</h1>
      <p style={{ color: "#aaa" }}>
        Tattoo Pricing Reality Check
      </p>

      {!showResults && (
        <div style={styles.card}>
          <h2>Enter your email to unlock results</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <button onClick={handleSubmit} style={styles.button}>
            See My Results
          </button>
        </div>
      )}

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
          label="Hourly Rate"
          value={hourlyRate}
          setValue={setHourlyRate}
        />
      </div>

      {showResults && (
        <div style={styles.card}>
          <h2>Results</h2>

          <p>Hourly Rate: ${hourlyRate}</p>

          <p>
            Actual Hourly: $
            {results.actualHourly.toFixed(2)}
          </p>

          <p>
            Yearly Income: ${results.yearlyIncome.toFixed(0)}
          </p>

          <p>
            Recommended: $
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

function Input({ label, value, setValue }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <label style={{ fontSize: "12px", color: "#aaa" }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{
          width: "100%",
          padding: "8px",
          marginTop: "4px",
          borderRadius: "6px",
        }}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px",
    fontFamily: "Arial",
    background: "#0f0f0f",
    color: "white",
    minHeight: "100vh",
  },
  card: {
    background: "#1a1a1a",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
  },
  button: {
    marginTop: "10px",
    padding: "12px",
    width: "100%",
    background: "orange",
    border: "none",
    borderRadius: "6px",
  },
  warningBig: {
    background: "#3a0000",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "10px",
  },
};
