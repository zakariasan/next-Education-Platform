// Seed definition for the first module. To add a new subject, copy this file,
// change the ids/titles, and register it in prisma/seed.ts (see docs/gamification.md).
import type { CriterionMode, Prisma } from "@prisma/client";

export type SeedCriterion = {
  title: string;
  description?: string;
  weight: number;
  mode: CriterionMode;
  autoConfig?: Prisma.InputJsonObject;
};

export type SeedProject = {
  id: string;
  title: string;
  isCore: boolean;
  estimatedHours: number;
  xpReward: number;
  statement: string;
  objectives: string[];
  allowedResources: string[];
  threshold?: number;
  prerequisites: string[];
  criteria: SeedCriterion[];
};

export type SeedModule = {
  id: string;
  title: string;
  subject: string;
  description: string;
  projects: SeedProject[];
};

const RES = {
  formula: "Formula sheet",
  calc: "Scientific calculator",
  sim: "PhET simulator",
  sheet: "Spreadsheet",
  video: "Phone camera (video)",
};

const P = (id: string) => `phys-mech-${id}`;

export const PHYSICS_MECHANICS: SeedModule = {
  id: "mod-physics-mechanics",
  title: "Physics – Mechanics",
  subject: "Physics",
  description:
    "From measuring the world to modelling motion, forces, energy and oscillations. Validate the common core to close the circuit; electives extend it.",
  projects: [
    {
      id: P("p01"),
      title: "Units & Measurement",
      isCore: true,
      estimatedHours: 3,
      xpReward: 100,
      prerequisites: [],
      objectives: [
        "Use SI base units and derived units correctly",
        "Estimate and propagate uncertainties",
        "Report results with correct significant figures",
      ],
      allowedResources: [RES.formula, RES.calc],
      statement: `## Measuring a pendulum period

Build a simple pendulum with a string and a small mass. Measure the period $T$ for a length $L \\approx 1\\,\\text{m}$ using 10 oscillations, repeated 5 times.

1. Compute the mean period and its uncertainty $\\Delta T$.
2. Estimate $g$ from $T = 2\\pi\\sqrt{L/g}$ and give $\\Delta g$.
3. Which SI unit does $g$ carry?`,
      criteria: [
        { title: "Unit of g", weight: 20, mode: "AUTO", autoConfig: { type: "UNIT", expectedUnit: "m/s²" } },
        { title: "Value of g within uncertainty", weight: 30, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 9.81, tolerance: 0.4, unit: "m/s²" } },
        { title: "Uncertainty analysis", weight: 30, mode: "TEACHER", description: "Propagation is explicit and correct." },
        { title: "Report clarity", weight: 20, mode: "PEER", description: "Tables, units and significant figures are readable." },
      ],
    },
    {
      id: P("p02"),
      title: "Vectors",
      isCore: true,
      estimatedHours: 4,
      xpReward: 120,
      prerequisites: [P("p01")],
      objectives: ["Add and decompose vectors", "Use dot and cross products physically", "Work in 2D coordinate frames"],
      allowedResources: [RES.formula, RES.calc],
      statement: `## River crossing

A boat moves at $4\\,\\text{m/s}$ relative to water; the river flows at $3\\,\\text{m/s}$.

1. What heading makes the boat land directly across? Give the resultant speed.
2. If the boat heads straight across instead, find drift after crossing a $120\\,\\text{m}$ wide river.
3. Sketch both cases with labelled vectors.`,
      criteria: [
        { title: "Resultant speed (heading upstream)", weight: 30, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 2.65, tolerance: 0.1, unit: "m/s" } },
        { title: "Drift distance", weight: 30, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 90, tolerance: 2, unit: "m" } },
        { title: "Vector diagrams", weight: 40, mode: "TEACHER" },
      ],
    },
    {
      id: P("p03"),
      title: "Kinematics in 1D",
      isCore: true,
      estimatedHours: 5,
      xpReward: 150,
      prerequisites: [P("p02")],
      objectives: ["Interpret x–t, v–t, a–t graphs", "Apply constant-acceleration equations", "Model free fall"],
      allowedResources: [RES.formula, RES.calc, RES.sim],
      statement: `## Braking distance

A car at $v_0 = 25\\,\\text{m/s}$ brakes with constant deceleration $a = -6\\,\\text{m/s}^2$.

1. Stopping distance?
2. Stopping time?
3. Plot $v(t)$ and $x(t)$; explain the graph areas.`,
      criteria: [
        { title: "Stopping distance", weight: 30, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 52.08, tolerance: 0.5, unit: "m" } },
        { title: "Stopping time", weight: 20, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 4.17, tolerance: 0.05, unit: "s" } },
        { title: "Graph interpretation", weight: 30, mode: "TEACHER" },
        { title: "Presentation", weight: 20, mode: "PEER" },
      ],
    },
    {
      id: P("p04"),
      title: "Projectile Motion",
      isCore: true,
      estimatedHours: 5,
      xpReward: 160,
      prerequisites: [P("p03")],
      objectives: ["Separate horizontal and vertical motion", "Derive range and max height", "Validate a model with video data"],
      allowedResources: [RES.formula, RES.calc, RES.video, RES.sheet],
      statement: `## Film a throw

Film a ball thrown at roughly $45^\\circ$. Track 10 frames.

1. From the data, estimate launch speed $v_0$.
2. Predict range with $R = v_0^2 \\sin 2\\theta / g$ and compare with the measured range.
3. Discuss sources of discrepancy.`,
      criteria: [
        { title: "Which quantity is constant in flight?", weight: 20, mode: "AUTO", autoConfig: { type: "MCQ", choices: ["Vertical velocity", "Horizontal velocity", "Speed", "Kinetic energy"], correctIndexes: [1] } },
        { title: "Model vs measurement", weight: 50, mode: "TEACHER" },
        { title: "Video analysis presentation", weight: 30, mode: "PEER" },
      ],
    },
    {
      id: P("p05"),
      title: "Newton's Laws",
      isCore: true,
      estimatedHours: 6,
      xpReward: 200,
      prerequisites: [P("p03")],
      objectives: ["Draw free-body diagrams", "Apply $\\sum F = ma$ to systems", "Handle tension and normal forces"],
      allowedResources: [RES.formula, RES.calc, RES.sim],
      statement: `## Atwood machine

Masses $m_1 = 2\\,\\text{kg}$ and $m_2 = 3\\,\\text{kg}$ hang over an ideal pulley.

1. Acceleration of the system?
2. Tension in the string?
3. Free-body diagram for each mass.`,
      criteria: [
        { title: "Acceleration", weight: 25, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 1.96, tolerance: 0.05, unit: "m/s²" } },
        { title: "Tension", weight: 25, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 23.5, tolerance: 0.3, unit: "N" } },
        { title: "Free-body diagrams", weight: 50, mode: "TEACHER" },
      ],
    },
    {
      id: P("p06"),
      title: "Friction & Inclines",
      isCore: true,
      estimatedHours: 5,
      xpReward: 180,
      prerequisites: [P("p05")],
      objectives: ["Distinguish static and kinetic friction", "Resolve forces on inclines", "Measure a friction coefficient"],
      allowedResources: [RES.formula, RES.calc],
      statement: `## Measure $\\mu$

Place an object on a board and raise one end until it starts sliding at angle $\\theta_s$; then find the angle $\\theta_k$ where it slides at constant speed.

1. Show $\\mu_s = \\tan\\theta_s$.
2. Report $\\mu_s$ and $\\mu_k$ with uncertainty.
3. Predict acceleration at $\\theta = 35^\\circ$ for your $\\mu_k$.`,
      criteria: [
        { title: "Derivation of μs = tan θ", weight: 30, mode: "TEACHER" },
        { title: "Measurement quality", weight: 40, mode: "TEACHER" },
        { title: "Lab notebook clarity", weight: 30, mode: "PEER" },
      ],
    },
    {
      id: P("p07"),
      title: "Work & Energy",
      isCore: true,
      estimatedHours: 6,
      xpReward: 220,
      prerequisites: [P("p05")],
      objectives: ["Apply the work–energy theorem", "Use conservation of mechanical energy", "Account for non-conservative work"],
      allowedResources: [RES.formula, RES.calc, RES.sim],
      statement: `## Roller-coaster loop

A cart starts from rest at height $h$ and enters a vertical loop of radius $r = 5\\,\\text{m}$ (frictionless).

1. Minimum $h$ so the cart stays on the track at the top of the loop.
2. Speed at the bottom for that $h$.
3. Now add friction losing 15% of energy before the loop: new minimum $h$?`,
      criteria: [
        { title: "Minimum height", weight: 30, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 12.5, tolerance: 0.2, unit: "m" } },
        { title: "Speed at bottom", weight: 20, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 15.66, tolerance: 0.2, unit: "m/s" } },
        { title: "Energy reasoning with losses", weight: 50, mode: "TEACHER" },
      ],
    },
    {
      id: P("p08"),
      title: "Momentum & Collisions",
      isCore: true,
      estimatedHours: 6,
      xpReward: 220,
      prerequisites: [P("p07")],
      objectives: ["Apply conservation of momentum", "Classify elastic vs inelastic collisions", "Use impulse"],
      allowedResources: [RES.formula, RES.calc, RES.sim],
      statement: `## Cart collision lab (simulator)

Cart A ($1\\,\\text{kg}$, $2\\,\\text{m/s}$) hits cart B ($3\\,\\text{kg}$, at rest).

1. Final velocities for a perfectly inelastic collision.
2. Final velocities for an elastic collision.
3. Fraction of kinetic energy lost in case 1.`,
      criteria: [
        { title: "Inelastic final speed", weight: 25, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 0.5, tolerance: 0.02, unit: "m/s" } },
        { title: "Energy fraction lost", weight: 25, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 0.75, tolerance: 0.02 } },
        { title: "Elastic case derivation", weight: 50, mode: "TEACHER" },
      ],
    },
    {
      id: P("p09"),
      title: "Circular Motion & Gravitation",
      isCore: true,
      estimatedHours: 6,
      xpReward: 240,
      prerequisites: [P("p04"), P("p05")],
      objectives: ["Use centripetal acceleration", "Apply Newton's law of gravitation", "Derive orbital speed and period"],
      allowedResources: [RES.formula, RES.calc],
      statement: `## Design a satellite orbit

Place a satellite in circular orbit at altitude $400\\,\\text{km}$ ($R_E = 6371\\,\\text{km}$, $M_E = 5.97\\times10^{24}\\,\\text{kg}$).

1. Orbital speed.
2. Period in minutes.
3. Explain why astronauts feel weightless though gravity is ~90% of surface value.`,
      criteria: [
        { title: "Orbital speed", weight: 30, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 7670, tolerance: 60, unit: "m/s" } },
        { title: "Period", weight: 20, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 92.5, tolerance: 1.5, unit: "min" } },
        { title: "Weightlessness explanation", weight: 50, mode: "TEACHER" },
      ],
    },
    {
      id: P("p10"),
      title: "Rotational Dynamics",
      isCore: true,
      estimatedHours: 8,
      xpReward: 300,
      prerequisites: [P("p08"), P("p09")],
      objectives: ["Use torque and moment of inertia", "Apply $\\tau = I\\alpha$", "Conserve angular momentum"],
      allowedResources: [RES.formula, RES.calc, RES.sim],
      statement: `## Rolling race

A solid sphere, a solid cylinder and a hoop roll without slipping down the same incline from rest.

1. Rank arrival order and justify with $I$.
2. Acceleration of the solid cylinder on a $30^\\circ$ incline.
3. Explain angular momentum conservation for a spinning skater pulling arms in.`,
      criteria: [
        { title: "Arrival order", weight: 20, mode: "AUTO", autoConfig: { type: "MCQ", choices: ["Hoop, cylinder, sphere", "Sphere, cylinder, hoop", "All together", "Cylinder, sphere, hoop"], correctIndexes: [1] } },
        { title: "Cylinder acceleration", weight: 30, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 3.27, tolerance: 0.05, unit: "m/s²" } },
        { title: "Derivations", weight: 50, mode: "TEACHER" },
      ],
    },
    {
      id: P("p11"),
      title: "Oscillations (SHM)",
      isCore: true,
      estimatedHours: 6,
      xpReward: 260,
      prerequisites: [P("p07")],
      objectives: ["Model simple harmonic motion", "Relate period to mass and stiffness", "Interpret energy in SHM"],
      allowedResources: [RES.formula, RES.calc, RES.sim, RES.sheet],
      statement: `## Mass–spring

A $0.5\\,\\text{kg}$ mass on a spring ($k = 200\\,\\text{N/m}$) is pulled $5\\,\\text{cm}$ and released.

1. Period and maximum speed.
2. Sketch $x(t)$, $v(t)$ and the energy exchange.
3. Fit measured data from the simulator to $x = A\\cos(\\omega t)$.`,
      criteria: [
        { title: "Period", weight: 25, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 0.314, tolerance: 0.01, unit: "s" } },
        { title: "Max speed", weight: 25, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 1.0, tolerance: 0.03, unit: "m/s" } },
        { title: "Data fit and graphs", weight: 50, mode: "TEACHER" },
      ],
    },
    {
      id: P("p12"),
      title: "Capstone: Pendulum Clock",
      isCore: true,
      estimatedHours: 10,
      xpReward: 400,
      prerequisites: [P("p10"), P("p11")],
      threshold: 75,
      objectives: ["Combine rotation, energy and oscillation models", "Design, build and test", "Communicate results"],
      allowedResources: [RES.formula, RES.calc, RES.sheet, RES.video],
      statement: `## Build a clock that keeps time for 5 minutes

Design a physical pendulum whose period is $2.000\\,\\text{s}$. Predict, build, measure, correct.

Deliver: design notes with the physical-pendulum formula $T = 2\\pi\\sqrt{I/(mgd)}$, measurement log, error budget, and a 3-minute presentation.`,
      criteria: [
        { title: "Physical model correctness", weight: 35, mode: "TEACHER" },
        { title: "Build & measurement", weight: 35, mode: "TEACHER" },
        { title: "Presentation", weight: 30, mode: "PEER" },
      ],
    },
    // Electives
    {
      id: P("e01"),
      title: "Dimensional Analysis Challenge",
      isCore: false,
      estimatedHours: 2,
      xpReward: 60,
      prerequisites: [P("p01")],
      objectives: ["Derive relations from dimensions alone"],
      allowedResources: [RES.formula],
      statement: `Using only dimensions, find how the period of a pendulum depends on $L$, $m$ and $g$. Then do the same for the speed of waves on a string ($T$, $\\mu$).`,
      criteria: [
        { title: "Pendulum: does the period depend on mass?", weight: 30, mode: "AUTO", autoConfig: { type: "MCQ", choices: ["Yes", "No"], correctIndexes: [1] } },
        { title: "Derivations", weight: 70, mode: "TEACHER" },
      ],
    },
    {
      id: P("e02"),
      title: "Air Resistance Simulation",
      isCore: false,
      estimatedHours: 5,
      xpReward: 180,
      prerequisites: [P("p04"), P("p06")],
      objectives: ["Model drag numerically", "Compare with the ideal projectile"],
      allowedResources: [RES.sheet, RES.calc],
      statement: `Write a spreadsheet Euler integration for a projectile with quadratic drag $F = -kv^2$. Show range vs. $k$ and explain the asymmetric trajectory.`,
      criteria: [
        { title: "Numerical model", weight: 60, mode: "TEACHER" },
        { title: "Clarity of plots", weight: 40, mode: "PEER" },
      ],
    },
    {
      id: P("e03"),
      title: "Rocket Propulsion",
      isCore: false,
      estimatedHours: 6,
      xpReward: 220,
      prerequisites: [P("p08")],
      objectives: ["Apply momentum to variable-mass systems", "Use the Tsiolkovsky equation"],
      allowedResources: [RES.formula, RES.calc],
      statement: `Derive the rocket equation $\\Delta v = v_e \\ln(m_0/m_f)$ and compute $\\Delta v$ for $v_e = 3000\\,\\text{m/s}$, $m_0/m_f = 5$.`,
      criteria: [
        { title: "Δv", weight: 40, mode: "AUTO", autoConfig: { type: "NUMERIC", answer: 4828, tolerance: 30, unit: "m/s" } },
        { title: "Derivation", weight: 60, mode: "TEACHER" },
      ],
    },
    {
      id: P("e04"),
      title: "Chaos: Double Pendulum",
      isCore: false,
      estimatedHours: 8,
      xpReward: 300,
      prerequisites: [P("p11")],
      objectives: ["Explore sensitivity to initial conditions", "Simulate coupled oscillators"],
      allowedResources: [RES.sim, RES.sheet, RES.video],
      statement: `Simulate or film a double pendulum. Show two runs with initial angles differing by $0.1^\\circ$ and quantify when they diverge.`,
      criteria: [
        { title: "Analysis", weight: 60, mode: "TEACHER" },
        { title: "Presentation", weight: 40, mode: "PEER" },
      ],
    },
  ],
};
