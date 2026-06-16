const { getBackupRoute } = require("../services/rerouteService");
const {
  getShipments,
  saveShipment,
  getShipmentById,
  updateShipment
} = require("../services/shipmentStorage");

const { computeNodeRisk } = require("./riskEngine");

function createShipmentData(body) {

  const path = Array.isArray(body.path)
    ? body.path
    : [];


  // calculate risk for every node
  const scoredNodes = path.map((node)=>{

    return computeNodeRisk({

      name: node,

      riskFactors:{

        // temporary simulated values
        congestionIndex:
          Math.floor(Math.random()*100),

        weatherSeverity:
          Math.floor(Math.random()*100),

        delayRate:
          Math.floor(Math.random()*100),

        geopoliticalRisk:
          Math.floor(Math.random()*100)

      }

    });

  });


  // average route risk
  const risk =
    scoredNodes.length > 0
    ?
    Math.round(
      scoredNodes.reduce(
        (sum,n)=>sum+n.riskScore,
        0
      )
      /
      scoredNodes.length
    )
    :
    0;

    let rerouteSuggestion = {
  shouldReroute:false,
  message:"Risk is acceptable"
};


if(risk >= 70){

  rerouteSuggestion = {

    shouldReroute:true,

    message:
      "High risk detected. Alternative route recommended.",

    route:[
      body.origin,
      "Dubai Hub",
      "Singapore Hub",
      body.destination
    ]

  };

}



  return {

    id:"SHP"+Date.now(),

    origin: body.origin || "",

    destination: body.destination || "",

    path,

    currentStep:0,

    progress:0,

    status:"Booked",

    mode:body.mode || "Sea",


    // calculated risk
    risk,


    recommendedRoute:
      body.recommendedRoute || [],


    eta:
      body.eta || "",


    plannedEta:
      body.plannedEta || "18h",


    predictedEta:
      `${18 + Math.round(risk/10)}h`,


    delayProbability:
      Math.min(
        95,
        Math.round(risk*0.8)
      ),


    healthScore:
      Math.max(
        10,
        100-risk
      ),


    alerts:[],


    rerouteSuggestion,


    createdAt:Date.now(),


    events:
      body.events || []

  };
}
   

    


  

 

  
  

function createShipment(req, res) {
  const shipment = createShipmentData(req.body);
  saveShipment(shipment);
  res.status(201).json(shipment);
}

function getAllShipments(req, res) {
  res.json(getShipments());
}

function getShipment(req, res) {
  const shipment = getShipmentById(req.params.id);
  if (!shipment) return res.status(404).json({ error: "Shipment not found" });
  res.json(shipment);
}

function patchShipment(req, res) {
  const updates = { ...req.body };

  if (updates.path && !Array.isArray(updates.path)) updates.path = [];
  if (updates.events && !Array.isArray(updates.events)) updates.events = [];
  if (updates.currentStep !== undefined) updates.currentStep = Number(updates.currentStep);
  if (updates.progress !== undefined) updates.progress = Number(updates.progress);
  if (updates.risk !== undefined) updates.risk = Number(updates.risk);

  const shipment = updateShipment(req.params.id, updates);
  if (!shipment) return res.status(404).json({ error: "Shipment not found" });
  res.json(shipment);
}

module.exports = {
  createShipment,
  getAllShipments,
  getShipment,
  patchShipment
};