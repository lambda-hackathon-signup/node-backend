const router = require("express").Router();
const Projects = require("./projects-model.js");

router.post("/", (req, res) => {
  const project = req.body;
  Projects.add(project)
    .then(saved => {
      res.status(201).json(saved))
    } 
    .catch(err => {
      res.status(500).json({ message: 'Error creating project'})
    });
});

router.get("/", (req, res) => {
  Projects.find()
    .then(projects => {
      res.status(200).json(projects)
    )} 
    .catch (err => {
      res.status(500).json({ message: 'Error creating project' })
    });
});

module.exports = router;
