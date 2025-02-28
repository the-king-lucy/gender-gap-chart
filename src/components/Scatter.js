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
import { motion, AnimatePresence } from "framer-motion";

const ScatterplotComponent = () => {
  const [data, setData] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [searchEmployer, setSearchEmployer] = useState("");
  const [employerInfo, setEmployerInfo] = useState(null);

  useEffect(() => {
    if (genderGapData && Array.isArray(genderGapData)) {
      setData(genderGapData);
    }
  }, []);

  const handleIndustryChange = (event) => {
    const industry = event.target.value;
    setSelectedIndustry(industry);
    const filteredData = genderGapData
      .filter((item) => item.industry === industry)
      .sort((a, b) => a["average-total-rem-gpg"] - b["average-total-rem-gpg"])
      .map((item, index) => ({ ...item, xIndex: index }));

    // Add fade-out and fade-in transition correctly
    setData([]); // Clear data to trigger fade-out
    setTimeout(() => {
      setData(filteredData); // Set the new data after a delay
    }, 300);

    setEmployerInfo(null);
  };

  const handleSearchChange = (event, value) => {
    const employer = value || "";
    setSearchEmployer(employer);
    const matchedEmployer = genderGapData.find(
      (item) => item.employer.toLowerCase() === employer.toLowerCase()
    );
    if (matchedEmployer) {
      setSelectedIndustry(matchedEmployer.industry);
      const filteredData = genderGapData
        .filter((item) => item.industry === matchedEmployer.industry)
        .sort((a, b) => a["average-total-rem-gpg"] - b["average-total-rem-gpg"])
        .map((item, index) => ({ ...item, xIndex: index }));
      setData(filteredData);
      setEmployerInfo(matchedEmployer);
    } else {
      setEmployerInfo(null);
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
          <p>{`${item.employer} has an average gender pay gap of ${item["average-total-rem-gpg"]}. ${item["upper-quartile-women"]}% of their leadership are women. The company has an average total remuneration of $${item["total-workforce-average-rem"]}.`}</p>
        </div>
      );
    }
    return null;
  };

  const industryMidpoint = industryMidpoints.find(
    (item) => item.industry === selectedIndustry
  )?.["mid-point"];

  const getEmployerMessage = () => {
    if (!employerInfo)
      return "Select an employer to see gender pay gap insights.";
    const {
      employer,
      "average-total-rem-gpg": gpg,
      "total-workforce-average-rem": rem,
      "upper-quartile-women": women,
    } = employerInfo;
    const industryMidpoint = industryMidpoints.find(
      (item) => item.industry === selectedIndustry
    )?.["mid-point"];

    let message = "";
    if (gpg > 5) {
      message = `${employer} has an average gender pay gap in favour of men.`;
    } else if (gpg < -5) {
      message = `${employer} has an average gender pay gap in favour of women.`;
    } else {
      message = `${employer} does not significantly favour men or women.`;
    }

    if (industryMidpoint !== undefined) {
      if (gpg > industryMidpoint) {
        message += " They are in the above average for their industry.";
      } else if (gpg < industryMidpoint) {
        message += " They are in the below average for their industry.";
      } else {
        message += " They are in the average for their industry.";
      }
    }

    message += ` At ${employer}, the total average remuneration is $${rem} and ${women}% of their leadership are women.`;

    return message;
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
          <AnimatePresence>
            {data.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="xIndex" hide={true} />
                    <YAxis
                      type="number"
                      dataKey="average-total-rem-gpg"
                      name="Average Total Rem GPG"
                      domain={[-100, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter name="Data Points" data={data} fill="#8884d8" />
                    {searchEmployer && (
                      <Scatter
                        name="Highlighted Employer"
                        data={data.filter(
                          (item) =>
                            item.employer.toLowerCase() ===
                            searchEmployer.toLowerCase()
                        )}
                        fill="#ff0000"
                      />
                    )}
                    {industryMidpoint && (
                      <ReferenceLine
                        y={industryMidpoint}
                        stroke="#82ca9d"
                        label="Industry Midpoint"
                        strokeDasharray="3 3"
                      />
                    )}
                    <ReferenceArea
                      y1={-5}
                      y2={5}
                      strokeOpacity={0.3}
                      fill="#d0eaff"
                      label="Target Range"
                    />
                    <ReferenceArea
                      y1={-100}
                      y2={-5}
                      strokeOpacity={0.1}
                      fill="#ffdddd"
                      label="In Favour of Women"
                    />
                    <ReferenceArea
                      y1={5}
                      y2={100}
                      strokeOpacity={0.1}
                      fill="#ddddff"
                      label="In Favour of Men"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScatterplotComponent;
