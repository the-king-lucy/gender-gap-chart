import React, { useEffect, useState, useCallback } from "react";
import { useMediaQuery } from "@mui/material";
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
    // Select,
    FormControl,
    InputLabel,
    // Autocomplete,
    // TextField,
    // Box,
} from "@mui/material";
import Select from "react-select";
import "../styles/scatterplot.css";
import genderGapData from "../data/gender-gap-main.json";
import industryMidpoints from "../data/industry-midpoints.json";
import FlashingDot from "./FlashingDot";
import AsyncSelect from "react-select/async";

const ScatterplotComponent = () => {
    const [data, setData] = useState(null);

    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [searchEmployer, setSearchEmployer] = useState("");
    const [employerInfo, setEmployerInfo] = useState(null);
    const isSmallScreen = useMediaQuery("(max-width:619px)"); // Detect screens smaller than 620px

    const [highlightedEmployer, setHighlightedEmployer] = useState(null);

    const handleIndustryChange = (event) => {
        if (!event) {
            setData(null);
            setSelectedIndustry(null);
            setHighlightedEmployer(null);
            setSearchEmployer(null);
            setEmployerInfo(null);
            return;
        }

        const industry = event.value;
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
            .sort(
                (a, b) =>
                    a["average-total-rem-gpg"] - b["average-total-rem-gpg"]
            )
            .map((item, index) => ({ ...item, xIndex: index }));

        setTimeout(() => {
            setData(filteredData);
        }, 500);
    };

    const handleSearchChange = (event) => {
        if (!event) {
            console.log("here");
            setEmployerInfo(null);
            setHighlightedEmployer(null);
            setData(null);
            setSearchEmployer(null);
            return;
        }

        const employer = event.value || "";
        setSearchEmployer(employer);

        const matchedEmployer = genderGapData.find(
            (item) => item.employer.toLowerCase() === employer.toLowerCase()
        );

        if (matchedEmployer) {
            setSelectedIndustry(matchedEmployer.industry);
            setEmployerInfo(matchedEmployer);

            const filteredData = genderGapData
                .filter((item) => item.industry === matchedEmployer.industry)
                .sort(
                    (a, b) =>
                        a["average-total-rem-gpg"] - b["average-total-rem-gpg"]
                )
                .map((item, index) => ({ ...item, xIndex: index }));

            setData(null);
            setTimeout(() => {
                setData(filteredData);
                setTimeout(() => {
                    const employerWithXIndex = filteredData.find(
                        (item) =>
                            item.employer.toLowerCase() ===
                            employer.toLowerCase()
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

    const employerOptions = genderGapData.map((item) => ({
        label: item.employer,
        value: item.employer,
    }));

    const CustomDot = (props) => {
        const { cx, cy } = props;
        const screenSizeFactor = window.innerWidth / 1000;
        const radius = Math.max(1, 2 * screenSizeFactor);

        return (
            <circle cx={cx} cy={cy} r={radius} fill="#333333" opacity={0.7} />
        );
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div className="custom-tooltip">
                    <p>
                        <span style={{ fontFamily: "var(--nano-bold-font)" }}>
                            {item.employer}
                        </span>{" "}
                        has an average gender pay gap of{" "}
                        <span style={{ fontFamily: "var(--nano-bold-font)" }}>
                            {item["average-total-rem-gpg"]}%
                        </span>
                        .
                    </p>
                    <p>
                        <span style={{ fontFamily: "var(--nano-bold-font)" }}>
                            {item["upper-quartile-women"]}%
                        </span>{" "}
                        of its top quartile earners are women.
                    </p>
                    <p>
                        The company has an average total remuneration of{" "}
                        <span style={{ fontFamily: "var(--nano-bold-font)" }}>
                            $
                            {item[
                                "total-workforce-average-rem"
                            ].toLocaleString()}
                        </span>
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

            return (
                <div>
                    <strong>{employer}</strong> has an average gender pay gap of{" "}
                    <span style={{ fontFamily: "SuecaHdsemibold" }}>
                        {gpg}%
                    </span>
                    {gpg > 5 ? (
                        <span
                            style={{ fontFamily: "SuecaHdsemibold" }}
                            className="gpg"
                        >
                            {" "}
                            in "favour of men".
                        </span>
                    ) : gpg < -5 ? (
                        <span
                            style={{ fontFamily: "SuecaHdsemibold" }}
                            className="gpg"
                        >
                            {" "}
                            in "favour of women".
                        </span>
                    ) : (
                        <>
                            ,{" "}
                            <span
                                style={{ fontFamily: "SuecaHdsemibold" }}
                                className="balance"
                            >
                                which is considered neutral.
                            </span>
                        </>
                    )}
                    <br />
                    <span>
                        The average total remuneration is{" "}
                        <span style={{ fontFamily: "SuecaHdsemibold" }}>
                            ${rem.toLocaleString()}
                        </span>{" "}
                        and{" "}
                        <span style={{ fontFamily: "SuecaHdsemibold" }}>
                            {women}%
                        </span>{" "}
                        of its top quartile earners are women.
                    </span>
                    {!isSmallScreen && (
                        <span>
                            {" "}
                            Hover over a dot on the chart to compare with other
                            employers.
                        </span>
                    )}
                </div>
            );
        }

        if (selectedIndustry) {
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
                            Each dot on the chart represents a company within{" "}
                            <span style={{ fontFamily: "SuecaHdsemibold" }}>
                                {industry}
                            </span>
                            ,
                        </span>{" "}
                        which is{" "}
                        {genderBalanced === "women" ? (
                            <span
                                style={{ fontFamily: "SuecaHdsemibold" }}
                                className="gpg"
                            >
                                a "women-dominated" industry.
                            </span>
                        ) : genderBalanced === "men" ? (
                            <span
                                style={{ fontFamily: "SuecaHdsemibold" }}
                                className="gpg"
                            >
                                a "men-dominated" industry.
                            </span>
                        ) : (
                            <span
                                style={{ fontFamily: "SuecaHdsemibold" }}
                                className="balance"
                            >
                                considered gender balanced.
                            </span>
                        )}
                        <br />
                        <span className="percent-women">
                            <span style={{ fontFamily: "SuecaHdsemibold" }}>
                                {percentWomen}%
                            </span>{" "}
                            of the workforce are women.
                        </span>{" "}
                        {!isSmallScreen && (
                            <span>
                                {" "}
                                Hover a dot to find information about different
                                employers.
                            </span>
                        )}
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
                    Enter your industry and company below to see how they
                    measure up.
                </span>
            </div>
        );
    };

    const promiseOptions = (inputValue) =>
        new Promise((resolve) => {
            if (inputValue.length < 3) {
                resolve([]);
                return;
            }
            resolve(
                employerOptions.filter((d) =>
                    d.value.toLowerCase().includes(inputValue.toLowerCase())
                )
            );
        });

    return (
        <div className="scatterplot-container">
            <Card
                className="scatterplot-card"
                sx={{
                    boxShadow: "none",
                }}
            >
                <CardContent
                    sx={{
                        padding: "2px",
                    }}
                >
                    <Card
                        className="employer-info-card"
                        sx={{
                            "&:last-child": { paddingBottom: "8px" },
                            boxShadow: "none",
                            border: "none",
                            marginBottom: "4px",
                            paddingBottom: "0px",
                            padding: "2px",
                        }}
                    >
                        <CardContent
                            sx={{
                                "&:last-child": { paddingBottom: "8px" },
                            }}
                        >
                            <Typography variant="body1">
                                {getEmployerMessage()}
                            </Typography>
                        </CardContent>
                    </Card>
                    <div className="search-section">
                        <Select
                            styles={{
                                control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    fontFamily: "SuecaNanoLight",
                                }),
                                menuList: (baseStyles, state) => ({
                                    ...baseStyles,
                                    fontFamily: "SuecaNanoLight",
                                }),
                            }}
                            isClearable={true}
                            placeholder="Industry"
                            options={industries.map((d) => ({
                                label: d,
                                value: d,
                            }))}
                            onChange={handleIndustryChange}
                            components={{
                                DropdownIndicator: () => null,
                                IndicatorSeparator: () => null,
                            }}
                            value={
                                selectedIndustry
                                    ? {
                                          label: selectedIndustry,
                                          value: selectedIndustry,
                                      }
                                    : null
                            }
                        />
                        <AsyncSelect
                            styles={{
                                control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    fontFamily: "SuecaNanoLight",
                                }),
                                menuList: (baseStyles, state) => ({
                                    ...baseStyles,
                                    fontFamily: "SuecaNanoLight",
                                }),
                            }}
                            isClearable={true}
                            isSearchable={true}
                            placeholder="Employer"
                            // options={employerOptions}
                            onChange={handleSearchChange}
                            noOptionsMessage={(input) =>
                                input.inputValue.length >= 3
                                    ? "No options"
                                    : "Search input must be at least 3 characters"
                            }
                            loadOptions={promiseOptions}
                            components={{
                                DropdownIndicator: () => null,
                                IndicatorSeparator: () => null,
                            }}
                            value={
                                searchEmployer
                                    ? {
                                          label: searchEmployer,
                                          value: searchEmployer,
                                      }
                                    : null
                            }
                            fontFamily={"SuecaNanoLight"}
                        />
                    </div>

                    <ResponsiveContainer width="100%" aspect={2}>
                        <ScatterChart
                            margin={{ top: 20, right: 0, left: 0, bottom: 10 }}
                        >
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
                                tickFormatter={(value) =>
                                    value === 0 ? "0" : value
                                }
                                fontSize={"clamp(10px, 1.5vw, 14px)"}
                                label={({ viewBox }) => {
                                    if (!viewBox) return null;

                                    return (
                                        <text
                                            x={viewBox.x / 2 + 30}
                                            y={viewBox.y + viewBox.height / 2}
                                            textAnchor="middle"
                                            fontSize={Math.max(
                                                Math.min(
                                                    viewBox.width * 0.015,
                                                    14
                                                ),
                                                10
                                            )}
                                            fill="#333333"
                                            fontFamily="var(--nano-bold-font)"
                                            transform={`rotate(-90, ${
                                                viewBox.x / 2 + 30
                                            }, ${
                                                viewBox.y + viewBox.height / 2
                                            })`}
                                        >
                                            Gender pay gap (%)
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

                                <linearGradient
                                    id="redGradientUp"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
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
                                            fontSize: Math.max(
                                                viewBox.width * 0.015,
                                                10
                                            ),
                                            fontWeight: "bold",
                                            textAnchor: "end",
                                        }}
                                    >
                                        Target range
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
                                            fontSize: Math.max(
                                                viewBox.width * 0.015,
                                                10
                                            ),
                                            fontWeight: "bold",
                                            textAnchor: "end",
                                            fill: "#c21616",
                                        }}
                                    >
                                        In favour of men
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
                                            fontSize: Math.max(
                                                viewBox.width * 0.015,
                                                10
                                            ),
                                            fontWeight: "bold",
                                            textAnchor: "end",
                                        }}
                                    >
                                        In favour of women
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
                                            y={
                                                viewBox.y -
                                                viewBox.height * 0.03 -
                                                3
                                            }
                                            style={{
                                                fontFamily:
                                                    "var(--nano-bold-font)",
                                                fill: "#333333",
                                                fontSize: Math.max(
                                                    viewBox.width * 0.015,
                                                    10
                                                ),
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Industry midpoint
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
                                    shape={(props) => (
                                        <FlashingDot {...props} />
                                    )}
                                />
                            )}
                            {!isSmallScreen && (
                                <Tooltip content={<CustomTooltip />} />
                            )}
                        </ScatterChart>
                        <text
                            x="50%"
                            y="95%"
                            textAnchor="left"
                            className="source-text"
                        >
                            Source: WGEA. The gender pay gap displayed here is
                            the difference between the average remuneration of
                            men and the average remuneration of women, expressed
                            as a percentage of men’s remuneration. The graphic
                            displays the average gap as it pertains to total
                            remuneration, which includes overtime, bonuses and
                            superannuation. A gender pay gap of +/-5 % is
                            considered neutral.
                        </text>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default ScatterplotComponent;
