import React, { useEffect, useState, useCallback } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import {
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  TextField,
  Box,
} from "@mui/material";
import "../styles/scatterplot.css";
import genderGapData from "../data/gender-gap-main.json";
import industryMidpoints from "../data/industry-midpoints.json";
import FlashingDot from "./FlashingDot"; // 👈 Adjust path if needed

const ScatterplotComponent = () => {
  const [data, setData] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [searchEmployer, setSearchEmployer] = useState("");
  const [employerInfo, setEmployerInfo] = useState(null);
  const getSize = (value) => Math.max(5, Math.min(15, value / 10000));
  const [highlightedEmployer, setHighlightedEmployer] = useState(null);

  useEffect(() => {
    if (genderGapData && Array.isArray(genderGapData)) {
      setData(genderGapData);
    }
  }, []);

  const renderXAxisLabel = useCallback(({ viewBox }) => {
    if (!viewBox) return null; // ✅ Prevents errors if viewBox is undefined

    return (
      <text
        x={viewBox.x + viewBox.width / 2} // ✅ Centers label horizontally
        y={viewBox.y + viewBox.height / 2 + 10} // ✅ Places it inside the middle of the chart
        textAnchor="middle"
        fontSize={Math.max(viewBox.width * 0.02, 12)}
        fontWeight="bold"
        fill="black"
      >
        Employer
      </text>
    );
  }, []);

  const handleIndustryChange = (event) => {
    const industry = event.target.value;
    setSelectedIndustry(industry);
    setHighlightedEmployer(null); // ✅ Clear highlighted dot initially

    // ✅ Reset employer selection
    setSearchEmployer(""); // Clears the employer search box
    setEmployerInfo(null); // Clears employer info

    const filteredData = genderGapData
      .filter((item) => item.industry === industry)
      .sort((a, b) => a["average-total-rem-gpg"] - b["average-total-rem-gpg"]) // Ensure sorting
      .map((item, index) => ({ ...item, xIndex: index }));

    setData([]);
    setTimeout(() => {
      setData(filteredData); // ✅ Load normal dots first
    }, 500);
  };

  const handleSearchChange = (event, value) => {
    const employer = value || "";
    setSearchEmployer(employer);

    const matchedEmployer = genderGapData.find(
      (item) => item.employer.toLowerCase() === employer.toLowerCase()
    );

    if (matchedEmployer) {
      setSelectedIndustry(matchedEmployer.industry);
      setEmployerInfo(matchedEmployer); // ✅ FIX: Update employerInfo

      // 1️⃣ Filter & sort data
      const filteredData = genderGapData
        .filter((item) => item.industry === matchedEmployer.industry)
        .sort((a, b) => a["average-total-rem-gpg"] - b["average-total-rem-gpg"])
        .map((item, index) => ({ ...item, xIndex: index }));

      setData([]);
      setHighlightedEmployer(null);

      setTimeout(() => {
        setData(filteredData); // ✅ Load all normal dots first

        setTimeout(() => {
          const employerWithXIndex = filteredData.find(
            (item) => item.employer.toLowerCase() === employer.toLowerCase()
          );

          if (employerWithXIndex) {
            setHighlightedEmployer(employerWithXIndex);
          }
        }, 500);
      }, 500);
    } else {
      setEmployerInfo(null); // ✅ Reset if no match
      setHighlightedEmployer(null);
    }
  };

  const industries = Array.from(
    new Set(genderGapData.map((item) => item.industry))
  );

  const employerOptions = genderGapData.map((item) => item.employer);

  const CustomDot = (props) => {
    const { cx, cy } = props;
    const screenSizeFactor = window.innerWidth / 1000; // Scale based on width
    const radius = Math.max(2, 4 * screenSizeFactor); // Ensure min/max size

    return <circle cx={cx} cy={cy} r={radius} fill="red" />;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p>
            <strong>{item.employer}</strong> has an average gender pay gap of{" "}
            <strong>{item["average-total-rem-gpg"]}%</strong>.
          </p>
          <p>
            <strong>{item["upper-quartile-women"]}%</strong> of their leadership
            are women.
          </p>
          <p>
            The company has an average total remuneration of{" "}
            <strong>
              ${item["total-workforce-average-rem"].toLocaleString()}
            </strong>
            .
          </p>
        </div>
      );
    }
    return null;
  };

  const industryMidpoint = industryMidpoints.find(
    (item) => item.industry === selectedIndustry
  )?.["mid-point"];

  const getEmployerMessage = () => {
    if (employerInfo) {
      const {
        employer,
        "average-total-rem-gpg": gpg,
        "total-workforce-average-rem": rem,
        "upper-quartile-women": women,
      } = employerInfo;
      const industryMidpoint = industryMidpoints.find(
        (item) => item.industry === selectedIndustry
      )?.["mid-point"];

      return (
        <div>
          <strong>{employer}</strong> has an average gender pay gap{" "}
          {gpg > 5 ? (
            <strong className="gpg">in favour of men.</strong>
          ) : gpg < -5 ? (
            <strong className="gpg">in favour of women.</strong>
          ) : (
            <strong className="balance">
              that does not significantly favour men or women.
            </strong>
          )}
          {industryMidpoint !== undefined && <></>}
          <br />
          <span>
            The total average remuneration is{" "}
            <span>${rem.toLocaleString()}</span> and <strong>{women}%</strong>{" "}
            of their leadership are women.
          </span>
        </div>
      );
    } else if (selectedIndustry) {
      const industryData = industryMidpoints.find(
        (item) => item.industry === selectedIndustry
      );

      if (industryData) {
        const {
          industry,
          "gender-balanced": genderBalanced,
          "percent-women": percentWomen,
        } = industryData;

        return (
          <div>
            <span className="industry-name">{industry}</span> is{" "}
            {genderBalanced === "women" ? (
              <strong className="gpg">a female-dominated industry.</strong>
            ) : genderBalanced === "men" ? (
              <strong className="gpg">a male-dominated industry.</strong>
            ) : (
              <strong className="balance">considered gender balanced.</strong>
            )}
            <br />
            <br></br>
            <span className="percent-women">
              <strong>{percentWomen}%</strong> of the workforce are women. Hover
              over a dot to find information about different employers.
            </span>
          </div>
        );
      }
    }
    return (
      <div>
        <span>Does your company have a gender pay gap?</span>
        <br></br>
        <br></br>
        <span>Choose an industry or an employer above to find out.</span>
      </div>
    );
  };

  return (
    <div className="scatterplot-container">
      <Card className="scatterplot-card">
        <CardContent>
          <FormControl fullWidth className="scatterplot-filter">
            <InputLabel>Industry</InputLabel>
            <Select
              value={selectedIndustry}
              onChange={handleIndustryChange}
              label="Industry"
            >
              {industries.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Autocomplete
            freeSolo
            options={employerOptions}
            value={searchEmployer}
            onInputChange={handleSearchChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                className="scatterplot-search"
                label="Search Employer"
                margin="normal"
              />
            )}
          />
          <Card className="employer-info-card" variant="outlined">
            <CardContent>
              <Typography variant="body1">{getEmployerMessage()}</Typography>
            </CardContent>
          </Card>

          <ResponsiveContainer width="100%" aspect={2}>
            <ScatterChart margin={{ top: 20, right: 10, left: 20, bottom: 10 }}>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="xIndex"
                tick={false} // ✅ Hide tick marks
                tickLine={false} // ✅ Hide tick lines
                axisLine={false} // ✅ Hide axis line
              />

              <YAxis
                type="number"
                dataKey="average-total-rem-gpg"
                name="Average Total Rem GPG"
                domain={[-100, 100]}
                tickFormatter={(value) => (value === 0 ? "0" : value)} // Ensures 0 is always visible
                label={({ viewBox }) => {
                  if (!viewBox) return null;

                  return (
                    <text
                      x={viewBox.x / 2 + 30} // Moves left of Y-axis (adjust if needed)
                      y={viewBox.y + viewBox.height / 2} // Centers along the Y-axis
                      textAnchor="middle"
                      fontSize={Math.max(viewBox.width * 0.015, 12)} // Responsive font size
                      fill="black"
                      transform={`rotate(-90, ${viewBox.x / 2 + 30}, ${
                        viewBox.y + viewBox.height / 2
                      })`} // Rotates in place
                    >
                      Gender Pay Gap (%)
                    </text>
                  );
                }}
              />

              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
              />

              {industryMidpoint && (
                <ReferenceLine
                  y={industryMidpoint}
                  stroke="#111111"
                  strokeDasharray="3 3"
                  label={({ viewBox }) => (
                    <text
                      x={viewBox.x + viewBox.width * 0.03} // ✅ Dynamic X position (3% of width)
                      y={viewBox.y - viewBox.height * 0.03 - 3} // ✅ Dynamic Y position
                      fill="#333333"
                      fontSize={Math.max(viewBox.width * 0.015, 12)} // ✅ Dynamic font size
                      fontWeight="bold"
                    >
                      Industry Midpoint
                    </text>
                  )}
                />
              )}

              <ReferenceArea
                y1={-5}
                y2={5}
                strokeOpacity={0.3}
                fill="#c7db9f"
                label={({ viewBox }) => (
                  <text
                    x={viewBox.x + viewBox.width - 20} // ✅ Place label at the right side
                    y={viewBox.y + viewBox.height / 2 + 3} // ✅ Center vertically
                    fill="#333333"
                    fontSize={12}
                    fontWeight="bold"
                    textAnchor="end" // ✅ Align text to the right
                  >
                    Target Range
                  </text>
                )}
              />

              <ReferenceArea
                y1={5}
                y2={100}
                strokeOpacity={0.1}
                fill="#ffdad9"
                label={({ viewBox }) => (
                  <text
                    x={viewBox.x + viewBox.width - 20} // ✅ Keep label on the right side
                    y={viewBox.y + 20} // ✅ Position at the top inside the chart
                    fill="#333333"
                    fontSize={Math.max(viewBox.width * 0.015, 12)} // ✅ Responsive font size
                    fontWeight="bold"
                    textAnchor="end" // ✅ Align text to the right
                  >
                    In Favour of Men
                  </text>
                )}
              />

              <ReferenceArea
                y1={-100}
                y2={-5}
                strokeOpacity={0.1}
                fill="#ffdad9"
                label={({ viewBox }) => (
                  <text
                    x={viewBox.x + viewBox.width - 20} // ✅ Keep label on the right side
                    y={viewBox.y + viewBox.height - 10} // ✅ Position at the bottom inside the chart
                    fill="#333333"
                    fontSize={Math.max(viewBox.width * 0.015, 12)} // ✅ Responsive font size
                    fontWeight="bold"
                    textAnchor="end" // ✅ Align text to the right
                  >
                    In Favour of Women
                  </text>
                )}
              />

              <Scatter
                name="Data Points"
                data={data}
                fill="#a5a5a5"
                shape={(props) => <CustomDot {...props} />}
                fillOpacity={0.7}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={300}
                animationEasing="ease-out"
              />
              {highlightedEmployer && (
                <Scatter
                  name="Highlighted Employer"
                  data={[highlightedEmployer]} // ✅ Correctly positioned red dot
                  isAnimationActive={true}
                  animationBegin={500} // ✅ Appears after normal dots
                  animationDuration={300}
                  animationEasing="ease-out"
                  shape={(props) => <FlashingDot {...props} />}
                />
              )}
            </ScatterChart>
            <text
              x="50%"
              y="95%" // Adjust position as needed
              textAnchor="left"
              fontSize={({ viewBox }) => Math.max(viewBox.width * 0.015, 8)}
              fill="black"
              style={{ fontStyle: "italic" }}
            >
              Source: Employer gender pay gaps report, March 2025. The 'gender
              pay gap' is defined as 'the difference between the average or
              median remuneration of men and the average or median remuneration
              of women, expressed as a percentage of men’s remuneration'.
            </text>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScatterplotComponent;
