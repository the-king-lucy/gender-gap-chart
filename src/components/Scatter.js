import React, { useEffect, useState } from "react";
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

  const handleIndustryChange = (event) => {
    const industry = event.target.value;
    setSelectedIndustry(industry);
    setHighlightedEmployer(null); // ✅ Clear highlighted dot initially

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

      // 1️⃣ Filter & sort data to ensure ascending order
      const filteredData = genderGapData
        .filter((item) => item.industry === matchedEmployer.industry)
        .sort((a, b) => a["average-total-rem-gpg"] - b["average-total-rem-gpg"])
        .map((item, index) => ({ ...item, xIndex: index })); // Assign correct xIndex

      setData([]);
      setHighlightedEmployer(null); // ✅ Remove red dot initially

      setTimeout(() => {
        setData(filteredData); // ✅ Load all normal dots first

        setTimeout(() => {
          // 2️⃣ Find correct `xIndex` for highlighted employer
          const employerWithXIndex = filteredData.find(
            (item) => item.employer.toLowerCase() === employer.toLowerCase()
          );

          if (employerWithXIndex) {
            setHighlightedEmployer(employerWithXIndex); // ✅ Ensure correct positioning
          }
        }, 500); // Slight delay for red dot
      }, 500);
    } else {
      setEmployerInfo(null);
      setHighlightedEmployer(null); // Reset if no match
    }
  };

  const industries = Array.from(
    new Set(genderGapData.map((item) => item.industry))
  );

  const employerOptions = genderGapData.map((item) => item.employer);

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
          <span className="employer-name">{employer}</span> has an average
          gender pay gap{" "}
          {gpg > 5 ? (
            <span className="text-red-500">in favour of men.</span>
          ) : gpg < -5 ? (
            <span className="text-blue-500">in favour of women.</span>
          ) : (
            "that does not significantly favour men or women."
          )}
          <br />
          {industryMidpoint !== undefined && (
            <>
              <br />
              <span className="industry-midpoint">
                They are in the{" "}
                {gpg > industryMidpoint ? (
                  <span className="text-green-500">above average</span>
                ) : gpg < industryMidpoint ? (
                  <span className="text-yellow-500">below average</span>
                ) : (
                  "average"
                )}{" "}
                for their industry.
              </span>
            </>
          )}
          <br />
          <span>
            At <strong>{employer}</strong>, the total average remuneration is{" "}
            <span className="remuneration-amount">${rem}</span> and{" "}
            <span className="leadership-women">{women}%</span> of their
            leadership are women.
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
              <span className="text-pink-500">
                a female-dominated industry.
              </span>
            ) : genderBalanced === "men" ? (
              <strong className="text-blue-500">
                a male-dominated industry.
              </strong>
            ) : (
              <span className="text-green-500">
                considered gender balanced.
              </span>
            )}
            <br />
            <br></br>
            <span className="percent-women">
              <strong>{percentWomen}%</strong> of the workforce are women.
            </span>
          </div>
        );
      }
    }
    return (
      <span>
        Select an employer or industry to see gender pay gap insights.
      </span>
    );
  };

  return (
    <div className="scatterplot-container">
      <Card className="scatterplot-card">
        <CardContent>
          <Typography variant="h5" className="scatterplot-title">
            Scatterplot Example
          </Typography>
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

          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{ top: 20, right: 30, left: 30, bottom: 50 }} // ✅ Increased bottom margin
            >
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="xIndex"
                tick={false} // ✅ Remove tick marks
                tickLine={false} // ✅ Remove tick lines
                axisLine={false} // ✅ Hide axis line
                label={({ viewBox }) => (
                  <text
                    x={viewBox.width * 0.7} // ✅ Dynamically centers label
                    y={viewBox.height + 320} // ✅ Adjusts position dynamically
                    textAnchor="middle"
                    fontSize={Math.max(viewBox.width * 0.02, 12)} // ✅ Scales with screen size, minimum 12px
                    fontWeight="bold"
                    fill="black"
                  >
                    Employer
                  </text>
                )}
              />

              <YAxis
                type="number"
                dataKey="average-total-rem-gpg"
                name="Average Total Rem GPG"
                domain={[-100, 100]}
                label={({ viewBox }) => (
                  <text
                    x={viewBox.x + viewBox.width / 2} // ✅ Centers horizontally in the chart
                    y={viewBox.y + 147} // ✅ Places it near the top
                    textAnchor="middle"
                    fontSize={Math.max(viewBox.width * 0.02, 12)} // ✅ Responsive font size
                    fontWeight="bold"
                    fill="black"
                    transform={`rotate(-90, ${viewBox.x + viewBox.width / 2}, ${
                      viewBox.y + 147
                    })`} // ✅ Rotates it correctly at the center
                  >
                    Gender Pay Gap
                  </text>
                )}
              />

              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
              />

              {industryMidpoint && (
                <ReferenceLine
                  y={industryMidpoint}
                  stroke="#82ca9d"
                  strokeDasharray="3 3"
                  label={({ viewBox }) => (
                    <text
                      x={viewBox.x + viewBox.width * 0.03} // ✅ Dynamic X position (3% of width)
                      y={viewBox.y - viewBox.height * 0.03} // ✅ Dynamic Y position
                      fill="black"
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
                fill="#d0eaff"
                label={({ viewBox }) => (
                  <text
                    x={viewBox.x + viewBox.width - 20} // ✅ Place label at the right side
                    y={viewBox.y + viewBox.height / 2} // ✅ Center vertically
                    fill="black"
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
                fill="#ddddff"
                label={({ viewBox }) => (
                  <text
                    x={viewBox.x + viewBox.width - 20} // ✅ Keep label on the right side
                    y={viewBox.y + 20} // ✅ Position at the top inside the chart
                    fill="black"
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
                fill="#ffdddd"
                label={({ viewBox }) => (
                  <text
                    x={viewBox.x + viewBox.width - 20} // ✅ Keep label on the right side
                    y={viewBox.y + viewBox.height - 10} // ✅ Position at the bottom inside the chart
                    fill="black"
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
                fill="#8884d8"
                sizeKey="size"
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
                  fill="#ff0000"
                  sizeKey="size"
                  isAnimationActive={true}
                  animationBegin={500} // ✅ Appears after normal dots
                  animationDuration={300}
                  animationEasing="ease-out"
                  shape={(props) => <FlashingDot {...props} />} // 👈 Custom animated dot
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScatterplotComponent;
