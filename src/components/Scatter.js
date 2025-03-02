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
import FlashingDot from "./FlashingDot";

const ScatterplotComponent = () => {
  const [data, setData] = useState(null);

  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [searchEmployer, setSearchEmployer] = useState("");
  const [employerInfo, setEmployerInfo] = useState(null);

  const [highlightedEmployer, setHighlightedEmployer] = useState(null);

  const handleIndustryChange = (event) => {
    const industry = event.target.value;
    setSelectedIndustry(industry);
    setHighlightedEmployer(null);
    setSearchEmployer("");
    setEmployerInfo(null);

    if (!industry) {
      setData(null);
      return;
    }

    const filteredData = genderGapData
      .filter((item) => item.industry === industry)
      .sort((a, b) => a["average-total-rem-gpg"] - b["average-total-rem-gpg"])
      .map((item, index) => ({ ...item, xIndex: index }));

    setTimeout(() => {
      setData(filteredData);
    }, 500);
  };

  const handleSearchChange = (event, value) => {
    const employer = value || "";
    setSearchEmployer(employer);

    if (!employer) {
      setEmployerInfo(null);
      setHighlightedEmployer(null);
      setData(null);
      return;
    }

    const matchedEmployer = genderGapData.find(
      (item) => item.employer.toLowerCase() === employer.toLowerCase()
    );

    if (matchedEmployer) {
      setSelectedIndustry(matchedEmployer.industry);
      setEmployerInfo(matchedEmployer);

      const filteredData = genderGapData
        .filter((item) => item.industry === matchedEmployer.industry)
        .sort((a, b) => a["average-total-rem-gpg"] - b["average-total-rem-gpg"])
        .map((item, index) => ({ ...item, xIndex: index }));

      setData(null);
      setTimeout(() => {
        setData(filteredData);
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
      setEmployerInfo(null);
      setHighlightedEmployer(null);
      setData(null);
    }
  };

  const industries = Array.from(
    new Set(genderGapData.map((item) => item.industry))
  );

  const employerOptions = genderGapData.map((item) => item.employer);

  const CustomDot = (props) => {
    const { cx, cy } = props;
    const screenSizeFactor = window.innerWidth / 1000;
    const radius = Math.max(1, 2 * screenSizeFactor);

    return <circle cx={cx} cy={cy} r={radius} fill="#333333" opacity={0.7} />;
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
            <span className="industry-name">
              Each dot on the chart represents a company within {industry},
            </span>{" "}
            which is{" "}
            {genderBalanced === "women" ? (
              <strong className="gpg">a female-dominated industry.</strong>
            ) : genderBalanced === "men" ? (
              <strong className="gpg">a male-dominated industry.</strong>
            ) : (
              <strong className="balance">considered gender balanced.</strong>
            )}
            <br />
            <span className="percent-women">
              <strong>{percentWomen}%</strong> of the workforce are women. Hover
              over a dot to find information about different employers.
            </span>
          </div>
        );
      }
    }
    return (
      <div className="intro-text">
        <span className="intro-text-larger">
          Explore how your boss measures up on the gender pay gap
        </span>
        <span>
          Enter your industry and company below to see how they measure up.
        </span>
      </div>
    );
  };

  return (
    <div className="scatterplot-container">
      <Card className="scatterplot-card">
        <CardContent>
          <Card
            className="employer-info-card"
            sx={{
              "&:last-child": { paddingBottom: "8px" },
              boxShadow: "none",
              border: "none",
              marginBottom: "4px",
              paddingBottom: "0px",
            }}
          >
            <CardContent
              sx={{
                "&:last-child": { paddingBottom: "8px" },
              }}
            >
              <Typography variant="body1">{getEmployerMessage()}</Typography>
            </CardContent>
          </Card>
          <div className="search-section">
            <FormControl
              variant="standard"
              className="scatterplot-filter"
              sx={{
                fontFamily: "YourFont, sans-serif",
                "& .MuiInputLabel-root": { fontFamily: "YourFont, sans-serif" },
                "& .MuiSelect-root": { fontFamily: "YourFont, sans-serif" },
                "& .MuiMenuItem-root": { fontFamily: "YourFont, sans-serif" },
              }}
            >
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
              variant="standard"
              freeSolo
              options={employerOptions}
              value={searchEmployer}
              onInputChange={handleSearchChange}
              className="scatterplot-search"
              sx={{
                width: "100%",
                fontFamily: "var(--nano-bold-font)",
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "inherit !important",
                },
                "& .MuiOutlinedInput-root.Mui-focused": {
                  borderColor: "inherit",
                },
                "& .MuiInput-underline:after": {
                  borderBottom: "none !important",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="scatterplot-search"
                  label="Search Employer"
                  variant="standard"
                  margin="normal"
                  sx={{
                    fontFamily: "var(--nano-bold-font)",
                    "& .MuiInputBase-input": {
                      fontFamily: "var(--nano-bold-font)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "inherit !important",
                    },
                    "& .MuiInputBase-root:focus-within": {
                      outline: "none",
                      boxShadow: "none",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "none !important",
                    },
                  }}
                />
              )}
            />
          </div>

          <ResponsiveContainer width="100%" aspect={2}>
            <ScatterChart margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <pattern
                  id="hashedPattern"
                  patternUnits="userSpaceOnUse"
                  width="8"
                  height="8"
                >
                  <path
                    d="M-1,1 l2,-2
             M0,8 l8,-8
             M7,9 l2,-2"
                    stroke="#767676"
                    strokeWidth="0.5"
                    fill="none"
                  />
                </pattern>
              </defs>

              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="xIndex"
                tick={false}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                type="number"
                dataKey="average-total-rem-gpg"
                name="Average Total Rem GPG"
                domain={[-100, 100]}
                tickFormatter={(value) => (value === 0 ? "0" : value)}
                fontSize={"clamp(10px, 1.5vw, 14px)"}
                label={({ viewBox }) => {
                  if (!viewBox) return null;

                  return (
                    <text
                      x={viewBox.x / 2 + 30}
                      y={viewBox.y + viewBox.height / 2}
                      textAnchor="middle"
                      fontSize={Math.max(
                        Math.min(viewBox.width * 0.015, 14),
                        10
                      )}
                      fill="#333333"
                      fontFamily="var(--nano-bold-font)"
                      transform={`rotate(-90, ${viewBox.x / 2 + 30}, ${
                        viewBox.y + viewBox.height / 2
                      })`}
                    >
                      Gender Pay Gap (%)
                    </text>
                  );
                }}
              />

              <defs>
                <linearGradient
                  id="redGradientDown"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#c21616" />
                </linearGradient>

                <linearGradient id="redGradientUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c21616" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>

              <ReferenceArea
                y1={-5}
                y2={5}
                strokeOpacity={0.3}
                fill="url(#hashedPattern)"
                label={({ viewBox }) => (
                  <text
                    x={viewBox.x + viewBox.width - 20}
                    y={viewBox.y + viewBox.height / 2 + 3}
                    style={{
                      fontFamily: "var(--nano-bold-font)",
                      fill: "#333333",
                      fontSize: Math.max(viewBox.width * 0.015, 10),
                      fontWeight: "bold",
                      textAnchor: "end",
                    }}
                  >
                    Target Range
                  </text>
                )}
              />

              <ReferenceArea
                y1={5}
                y2={100}
                strokeOpacity={0.1}
                fill="url(#redGradientUp)"
                label={({ viewBox }) => (
                  <text
                    x={viewBox.x + viewBox.width - 20}
                    y={viewBox.y + 20}
                    style={{
                      fontFamily: "var(--nano-bold-font)",
                      fontSize: Math.max(viewBox.width * 0.015, 12),
                      fontWeight: "bold",
                      textAnchor: "end",
                      fill: "#c21616",
                    }}
                  >
                    In Favour of Men
                  </text>
                )}
              />

              <ReferenceArea
                y1={-100}
                y2={-5}
                strokeOpacity={0.1}
                fill="url(#redGradientDown)"
                label={({ viewBox }) => (
                  <text
                    x={viewBox.x + viewBox.width - 20}
                    y={viewBox.y + viewBox.height - 10}
                    style={{
                      fontFamily: "var(--nano-bold-font)",
                      fill: "#c21616",
                      fontSize: Math.max(viewBox.width * 0.015, 12),
                      fontWeight: "bold",
                      textAnchor: "end",
                    }}
                  >
                    In Favour of Women
                  </text>
                )}
              />

              {industryMidpoint && (
                <ReferenceLine
                  y={industryMidpoint}
                  stroke="#333333"
                  strokeDasharray="3 3"
                  label={({ viewBox }) => (
                    <text
                      x={viewBox.x + viewBox.width * 0.03}
                      y={viewBox.y - viewBox.height * 0.03 - 3}
                      style={{
                        fontFamily: "var(--nano-bold-font)",
                        fill: "#333333",
                        fontSize: Math.max(viewBox.width * 0.015, 10),
                        fontWeight: "bold",
                      }}
                    >
                      Industry Midpoint
                    </text>
                  )}
                />
              )}
              {data && (
                <Scatter
                  name="Data Points"
                  data={data}
                  fill="#d4d4d4"
                  shape={(props) => <CustomDot {...props} />}
                  fillOpacity={1}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={300}
                  animationEasing="ease-out"
                />
              )}
              {highlightedEmployer && data && (
                <Scatter
                  name="Highlighted Employer"
                  data={[highlightedEmployer]}
                  isAnimationActive={true}
                  animationBegin={500}
                  animationDuration={300}
                  animationEasing="ease-out"
                  shape={(props) => <FlashingDot {...props} />}
                />
              )}
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
              />
            </ScatterChart>
            <text x="50%" y="95%" textAnchor="left" className="source-text">
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
