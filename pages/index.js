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

const [hourlyRate, setHourlyRate] = useState(150);
const [incomeType, setIncomeType] = useState("percentage");
const [shopPercentage, setShopPercentage] = useState(0.5);

export default function Home() {
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
      await fetch("https://formspree.io/f/mbdpawkn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          state,
          source: "Tattoo Pricing Tool",
        }),
      });

      setShowResults(true);
    } catch (error) {
      alert("Something went wrong. Try again.");
    }
  };

  return (
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

  {incomeType === "percentage" && (
    <Input
      label="Shop Percentage (0.5 = 50%)"
      value={shopPercentage}
      setValue={setShopPercentage}
    />
  )}

  <Input
    label="Your Hourly Rate"
    value={hourlyRate}
    setValue={setHourlyRate}
  />
</div>
        )}

        {showResults && (
          <div style={{ display: "grid", gap: "20px" }}>
            <div style={styles.card}>
              <h2>Location</h2>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={styles.input}
              >
                {Object.keys(stateTaxes).map((s) => (
                  <option key={s} value={s}>
                    {s} ({(stateTaxes[s] * 100).toFixed(2)}%)
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.card}>
              <h2>Inputs</h2>

              <Input label="Shop Rent" value={monthlyRent} setValue={setMonthlyRent} />
              <Input label="Supplies" value={supplies} setValue={setSupplies} />
              <Input label="Insurance" value={insurance} setValue={setInsurance} />
              <Input label="Misc Costs" value={misc} setValue={setMisc} />
              <Input label="Desired Monthly Income" value={desiredIncome} setValue={setDesiredIncome} />
              <Input label="Hours Per Week" value={hoursPerWeek} setValue={setHoursPerWeek} />
              <Input label="Weeks Per Month" value={weeksPerMonth} setValue={setWeeksPerMonth} />
              <Input label="Booking Rate (0-1)" value={bookingRate} setValue={setBookingRate} />
            </div>

            <div style={styles.card}>
              <h2>Your Results</h2>

<p>Your hourly rate: <strong>${hourlyRate}</strong></p>

<p>
  After shop split, taxes, and expenses:<br />
  <strong>You actually earn: ${results.actualHourly.toFixed(2)}/hr</strong>
</p>

<p>
  Annual income (real): ${results.yearlyIncome.toFixed(0)}
</p>

<hr style={{ margin: "15px 0", borderColor: "#333" }} />

<p>
  To hit your goal:<br />
  <strong>You should charge: ${results.recommendedHourly.toFixed(0)}/hr</strong>
</p>

{results.underpricingAmount > 0 && (
  <div style={styles.warningBig}>
    ⚠️ You are undercharging by ${results.underpricingAmount.toFixed(0)}/hr
  </div>
)}

<div style={{ marginTop: "20px", fontSize: "20px" }}>
  <span>🎯 Your Tattoo Business Score: </span>
  <strong>{results.score}/100</strong>
</div>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, setValue }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <label style={{ fontSize: "12px", color: "#aaa" }}>{label}</label>
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
  page: {
    background: "#0f0f0f",
    color: "white",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Arial",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  card: {
    background: "#1a1a1a",
    padding: "20px",
    borderRadius: "12px",
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
    marginBottom: "15px",
  },
  warningSmall: {
    background: "#330000",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
};
