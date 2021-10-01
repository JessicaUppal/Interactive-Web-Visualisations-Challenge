# Import dependancies
import pandas as pd
import numpy as np
from sqlalchemy.ext.automap import automap_base
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, jsonify, render_template
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

# Setup flask
app = Flask(__name__)

# Establish connection
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/bellybutton.sqlite"
db = SQLAlchemy(app)

Base = automap_base()
Base.prepare(db.engine, reflect=True)
Samples_Metadata = Base.classes.sample_metadata
Samples = Base.classes.samples

# Set initial route 
@app.route("/")
def index():
# Return to homepage
    return render_template("index.html")

# Set route
@app.route("/names")
def names():
    # Perform SQL query
    stmt = db.session.query(Samples).statement
    df = pd.read_sql_query(stmt, db.session.bind)
# Get complete names list
    return jsonify(list(df.columns)[2:])

# Set route 
@app.route("/metadata/<sample>")
def sample_metadata(sample):
    sel = [
        Samples_Metadata.sample,
        Samples_Metadata.ETHNICITY,
        Samples_Metadata.GENDER,
        Samples_Metadata.AGE,
        Samples_Metadata.LOCATION,
        Samples_Metadata.BBTYPE,
        Samples_Metadata.WFREQ,
    ]

    results = db.session.query(*sel).filter(Samples_Metadata.sample == sample).all()

    # Create a dictionary entry for information
    sample_metadata = {}
    for result in results:
        sample_metadata["sample"] = result[0]
        sample_metadata["ETHNICITY"] = result[1]
        sample_metadata["GENDER"] = result[2]
        sample_metadata["AGE"] = result[3]
        sample_metadata["LOCATION"] = result[4]
        sample_metadata["BBTYPE"] = result[5]
        sample_metadata["WFREQ"] = result[6]

    print(sample_metadata)
    return jsonify(sample_metadata)

#Set route
@app.route("/samples/<sample>")
def samples(sample):

    stmt = db.session.query(Samples).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Filter data values above 1
    sample_data = df.loc[df[sample] > 1, ["otu_id", "otu_label", sample]]
    sample_data.sort_values(by=sample, ascending=False, inplace=True)

    
    # Jsonify the data
    data = {
        "otu_ids": sample_data.otu_id.values.tolist(),
        "sample_values": sample_data[sample].values.tolist(),
        "otu_labels": sample_data.otu_label.tolist(),
    }
    return jsonify(data)

# Run app
if __name__ == "__main__":
    app.run()
