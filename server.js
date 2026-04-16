const {readFileSync, writeFileSync} = require('fs');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// --- SET UP ---

//python set up
const { spawn } = require("child_process");
const { exec } = require("child_process");
let pythonProcess = null;
app.use(express.json());

// database setup 
let db = new sqlite3.Database("./database/mindfulByte.db" , (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    }
    db.configure('busyTimeout', 4000);
    db.run("PRAGMA journal_mode = WAL;");

    console.log('Connected to user database');
});


// ------- APIS ---------

// * database apis *

// authentication
app.post('/validate-user', (req,res) => {
    const {username, password} = req.body;
    db.all(`SELECT * FROM users WHERE username = ? and password = ?`, [username, password], (err, user) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            if (user.length > 0) {
                res.json({ valid: true, role: user[0].role, id: user[0].id });
            } else {
                res.json({ valid: false });
            }
        }
    });
})

app.post('/register-user', (req,res) => {
    const {username, password, caregiverID} = req.body;
    db.serialize(() => {
      db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, 'user')`, [username, password], function(err) {
          if (err) {
              console.error('Database insert error:', err);
              res.status(500).json({ error: 'Database insert failed' });
          } else {
              const id = this.lastID;
              const caregiverIDInt = Number(caregiverID)
              db.run(`INSERT INTO caregivers_patients (user_id, caregiver_id) VALUES (?, ?)`, [id, caregiverIDInt], (err) => {
                  if (err) {
                      console.error('Database insert error:', err);
                      res.status(500).json({ error: 'Database insert failed' });
                  } else {
                      res.json({ success: true, id: id });
                  }
              });
          }
      });
  });
});

app.post('/insert-user-quotes', (req,res) => {
    const {id, recover, miss, person, remember, quote} = req.body;
    db.run(`INSERT INTO quotes (user_id, reasons_to_recover, miss_enjoying, doing_this_for, things_get_hard, fav_recovery_quote) VALUES (?, ?, ?, ?, ? ,?)`, [id, recover, miss, person, remember, quote], (err) => {
        if (err) {
            console.error('Database insert error:', err);
            res.status(500).json({ error: 'Database insert failed' });
        } else {
            res.json({ success: true });
        }
    });
}); 


app.post('/register-caregiver', (req,res) => {
    const {username, password} = req.body;
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, 'caregiver')`, [username, password], (err) => {
        if (err) {
            console.error('Database insert error:', err);
            res.status(500).json({ error: 'Database insert failed' });
        } else {
            res.json({ success: true });
        }
    });
}); 

// *caregivers*
app.get('/get-patients', (req,res) => {
    const caregiverID = req.query.caregiverID;
    db.all(`SELECT users.id, users.username FROM users, caregivers_patients WHERE caregiver_id = ? AND users.id = caregivers_patients.user_id`, [caregiverID], (err, patients) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json({ patients: patients})
          }
    });  
});

app.get('/get-meal-sessions', (req,res) => {  
    const patientID = req.query.patientID;
    db.all(`SELECT * FROM meal_session WHERE user_id = ?`, [patientID], (err, sessions) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json({ sessions: sessions})
          }
    })
}); 

app.get('/get-meal-metrics', (req,res) => {  
    const mealID = req.query.mealID;
    //get most the metrics
    db.get(`SELECT * FROM meal_session, meal_metrics WHERE meal_session.meal_id = ? AND meal_metrics.meal_id = meal_session.meal_id`, [mealID], (err, meal) => {  
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            // get journal entries 
            db.get('SELECT * FROM meal_journal WHERE meal_id = ?', [mealID], (err, journal) => {
                if (err) {
                    console.error('Database query error:', err);
                    res.status(500).json({ error: 'Database query failed' });
                }
                //get prompts 
                db.all(`SELECT prompt FROM prompts WHERE meal_id = ?`, [mealID], (err, prompts) => {
                    if(err){
                        console.error('Database query error:', err);
                        res.status(500).json({ error: 'Database query failed' });
                    }

                    //get portions 
                    db.all(`SELECT portion_size FROM portion_sizes WHERE meal_id = ?`, [mealID], (err, portions) => {
                        if(err){
                            console.error('Database query error:', err);
                            res.status(500).json({ error: 'Database query failed' });
                        }
                        res.json({
                            meal,
                            journal, 
                            prompts: prompts.map(p => p.prompt),
                            portionSizes: portions.map(p => p.portion_size)
                        });
                        
                    }); 

                }); 

            }); 
          }
    }); 
});

app.get('/get-username', (req,res) => {  
    const userID = req.query.userID;

    if (!userID || userID === 'undefined') {
        return res.status(400).json({ error: 'Missing userID' });
    }

    db.get(`SELECT username FROM users WHERE id = ?`, [userID], (err, row) => {  
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json({ username: row.username})
          }
    }); 
});

// * users api *

app.post('/start-meal', (req,res) => {
    const {id, meal_date, meal_name, meal_type, meal_environment, pre_meal_rating, pre_meal_journal} = req.body;
    db.run(`INSERT INTO meal_session (user_id, meal_date, meal_name, meal_type, meal_environment) VALUES (?, ?, ?, ?, ?)`,
        [id, meal_date, meal_name, meal_type, meal_environment], function(err) {
            if (err) {
                console.error('Database insert error:', err);
                res.status(500).json({ error: 'Database insert failed' });
            } else {
                const mealID = this.lastID;
                db.run(`INSERT INTO meal_journal (meal_id, pre_meal_rating, pre_meal_journal, post_meal_journal, post_meal_rating) VALUES (?, ?, ?, 0, "NOT FINISHED")`,
                    [mealID, pre_meal_rating, pre_meal_journal], (err) => {
                        if (err) {
                            console.error('Database insert error:', err);
                            res.status(500).json({ error: 'Database insert failed' });
                        } else {
                            res.json({ success: true, meal_id: mealID });
                        }
                    });
            }
        }
    );
});

app.put('/update-post-meal-journal', (req,res) => {
    const {mealID, post_meal_rating, post_meal_journal} = req.body;
    db.run(`UPDATE meal_journal SET post_meal_rating = ?, post_meal_journal = ? WHERE meal_id = ?`,
        [post_meal_rating, post_meal_journal, mealID], function(err) {
            if (err) {
                console.error('Database update error:', err);
                res.status(500).json({ error: 'Database update failed' });
            } else {
                res.json({ success: true });
            }
        }
    );
}); 


// * hardware apis *

//start sensors 
app.post("/start-sensors", (req, res) => {
  const { mealID, userID } = req.body;
  
  if (pythonProcess) {
    return res.json({ message: "Sensor script already running" });
  }

  // Run loadSensors.py
  pythonProcess = spawn("sudo", ["python3", "-u", "loadSensor.py", mealID, userID], {
    cwd: __dirname,
  });

  pythonProcess.stdout.on("data", (data) => {
    console.log(`PYTHON: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`PYTHON ERROR: ${data}`);
  });

  pythonProcess.on("close", () => {
    console.log("Python sensor script stopped");
    pythonProcess = null;
  });

  res.json({ message: "Sensor script started" });
});


app.post('/send-meal-analytics', (req,res) => {
    const {meal_id, time_of_meal, time_to_first_bite, start_weight, portions, pause_count, shake_count, prompts} = req.body;
    db.run(`INSERT INTO meal_metrics (meal_id, time_of_meal, time_to_first_bite, start_weight, shake_count, pause_count) VALUES (?, ?, ?, ?, ?, ?)`,
        [meal_id, time_of_meal, time_to_first_bite, start_weight, shake_count, pause_count], function(err) {
            if(err){
                console.error('Database insert error:', err); 
                res.status(500).json({ error: 'Database insert failed' });
            } else{
                for(let i = 0; i < portions.length; i++){
                    db.run(`INSERT INTO portion_sizes (meal_id, portion_size) VALUES (?,?)`,
                        [meal_id, portions[i]], (err) => {
                            if (err){
                                console.error('Database insert error:', err);
                                res.status(500).json({ error: 'Database insert failed' });
                            }
                        }
                        
                    );
                }
                for(let i = 0; i < prompts.length; i++){
                    db.run(`INSERT INTO prompts (meal_id, prompt) VALUES (?,?)`,
                        [meal_id, prompts[i]], (err) => {
                            if (err){
                                console.error('Database insert error:', err);
                                res.status(500).json({ error: 'Database insert failed' });
                            }
                        }
                        
                    );
                }

            }
        res.json({ success: true});
    });
}); 


app.get('/get-prompts', (req,res) => {
    const userID = req.query.userID;
    db.get(`SELECT * FROM quotes WHERE user_id = ?`, [userID], (err, row) => {
        if(err){
            console.error("Database query error: ", err); 
            res.status(500).json({error: "Database query failed"}); 
        } else{
            res.json({quotes: row})
        }
    })
})


app.get('/get-meal-sessions', (req,res) => {  
    const patientID = req.query.patientID;
    db.all(`SELECT * FROM meal_session WHERE user_id = ?`, [patientID], (err, sessions) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json({ sessions: sessions})
          }
    })
}); 



app.post("/stop-sensors", (req, res) => {
  if (!pythonProcess) {
    return res.json({ message: "Sensors not running" });
  }

  // use sudo pkill to target the python script
  exec("sudo pkill -SIGTERM -f loadSensor.py", (error, stdout, stderr) => {
      if (error) {
          console.error(`Error killing process: ${error}`);
      }
      console.log("Python sensor script stopped via pkill");
      pythonProcess = null;
      res.json({ success: true });
  });
});



app.post('/start-meal', (req,res) => {
    const {id, meal_date, meal_name, meal_type, meal_environment, pre_meal_rating, pre_meal_journal} = req.body;
    db.run(`INSERT INTO meal_session (user_id, meal_date, meal_name, meal_type, meal_environment) VALUES (?, ?, ?, ?, ?)`,
        [id, meal_date, meal_name, meal_type, meal_environment], function(err) {
            if (err) {
                console.error('Database insert error:', err);
                res.status(500).json({ error: 'Database insert failed' });
            } else {
                const mealID = this.lastID;
                db.run(`INSERT INTO meal_journal (meal_id, pre_meal_rating, pre_meal_journal, post_meal_journal, post_meal_rating) VALUES (?, ?, ?, 0, "NOT FINISHED")`,
                    [mealID, pre_meal_rating, pre_meal_journal], (err) => {
                        if (err) {
                            console.error('Database insert error:', err);
                            res.status(500).json({ error: 'Database insert failed' });
                        } else {
                            res.json({ success: true, meal_id: mealID });
                        }
                    });
            }
        }
    );
});


app.use(express.static(path.join(__dirname, 'build')));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(5000,() => console.log('http://localhost:5000'));