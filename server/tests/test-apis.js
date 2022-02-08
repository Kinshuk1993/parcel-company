"use strict";

import { ParcelDB } from "../model/schema.js";
import { TruckDB } from "../model/schema.js";

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../app.js';
let should = chai.should();

chai.use(chaiHttp);

describe('Parcels', () => {

  beforeEach((done) => {
    ParcelDB.deleteMany({}, (_err) => {
      done();
    });
  });

  afterEach((done) => {
    ParcelDB.deleteMany({}, (_err) => {
      done();
    });
  });

  describe('/POST parcel', () => {
    it('it should not POST a parcel with empty name', (done) => {
      let parcel = {
        name: "",
        weight: 10
      }
      chai.request(app)
        .post('/parcel')
        .send(parcel)
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("validation failed"));
          done();
        });
    });

    it('it should not POST a parcel with all inputs missing', (done) => {
      chai.request(app)
        .post('/parcel')
        .send({})
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("validation failed"));
          done();
        });
    });

    it('it should not POST a parcel with missing weight', (done) => {
      let parcel = {
        name: "Dummy parcel 1"
      }
      chai.request(app)
        .post('/parcel')
        .send(parcel)
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("validation failed"));
          done();
        });
    });

    it('it should not POST a parcel with negative weight', (done) => {
      let parcel = {
        name: "Dummy parcel 1",
        weight: -1
      }
      chai.request(app)
        .post('/parcel')
        .send(parcel)
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("validation failed"));
          done();
        });
    });

    it('it should POST a parcel', (done) => {
      let parcel = {
        name: "Dummy parcel 1",
        weight: 10
      }
      chai.request(app)
        .post('/parcel')
        .send(parcel)
        .end((_err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.not.have.property('error');
          res.body.should.have.property('id');
          done();
        });
    });
  });

  describe('/GET/:id parcel', () => {
    it('it should GET a parcel by the given id after creating it', (done) => {
      let parcel = {
        name: "Dummy parcel 1",
        weight: 10
      }
      new ParcelDB(parcel).save((_err, parcel) => {
        chai.request(app)
          .get('/parcel/' + parcel.id)
          .send()
          .end((_err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('name');
            res.body.should.have.property('weight');
            res.body.should.have.property('truckId');
            res.body.should.have.property('loaded');
            res.body.should.have.property('_id').eql(parcel.id);
            done();
          });
      });
    });

    it('it should not GET a parcel by the given id that does not exist', (done) => {
      chai.request(app)
        .get('/parcel/61967133c1626e60e9750f7a')
        .send()
        .end((_err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.not.have.property('name');
          res.body.should.not.have.property('weight');
          res.body.should.not.have.property('_id').eql("61967133c1626e60e9750f7a");
          res.body.should.have.property('error');
          chai.assert(res.body.error.includes("Parcel with id 61967133c1626e60e9750f7a not found"));
          done();
        });
    });

    it('it should not GET a parcel by an invalid id', (done) => {
      chai.request(app)
        .get('/parcel/61967133c1626e60e9750f7a12345g')
        .send()
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.not.have.property('name');
          res.body.should.not.have.property('weight');
          res.body.should.not.have.property('_id').eql("61967133c1626e60e9750f7a");
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("Cast to ObjectId failed for value"));
          done();
        });
    });
  });

  describe('/GET getAllParcels', () => {
    it('it should GET all the parcels', (done) => {
      chai.request(app)
        .get('/getAllParcels')
        .end((_err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe('/DELETE/:id parcel', () => {
    it('it should DELETE a parcel given the id', (done) => {
      let parcel = {
        name: "Dummy parcel 1",
        weight: 10
      }
      new ParcelDB(parcel).save((_err, parcel) => {
        chai.request(app)
          .delete('/parcel/' + parcel.id)
          .end((_err, res) => {
            res.should.have.status(204);
            res.body.should.be.a('object');
            res.body.should.be.empty;
            done();
          });
      });
    });

    it('it should not DELETE a parcel if it does not exist', (done) => {
      chai.request(app)
        .delete('/parcel/61967133c1626e60e9750f7a')
        .end((_err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.includes("Parcel with id 61967133c1626e60e9750f7a not found"));
          done();
        });
    });

    it('it should not DELETE a parcel by an invalid id', (done) => {
      chai.request(app)
        .delete('/parcel/61967133c1626e60e9750f7a12345g')
        .send()
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("Cast to ObjectId failed for value"));
          done();
        });
    });
  });
});

describe('Trucks', () => {

  beforeEach((done) => {
    TruckDB.deleteMany({}, (_err) => {
      done();
    });
  });

  afterEach((done) => {
    TruckDB.deleteMany({}, (_err) => {
      done();
    });
  });

  describe('/POST truck', () => {
    it('it should not POST a truck with 0 weight', (done) => {
      let truck = {
        truckWeight: 0
      }
      chai.request(app)
        .post('/truck')
        .send(truck)
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("validation failed"));
          done();
        });
    });

    it('it should not POST a truck with all inputs missing', (done) => {
      chai.request(app)
        .post('/truck')
        .send({})
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("validation failed"));
          done();
        });
    });

    it('it should not POST a truck with missing weight', (done) => {
      let truck = {
        totalWeight: 500
      }
      chai.request(app)
        .post('/truck')
        .send(truck)
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("validation failed"));
          done();
        });
    });

    it('it should not POST a truck with negative weight', (done) => {
      let truck = {
        truckWeight: -1
      }
      chai.request(app)
        .post('/truck')
        .send(truck)
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("validation failed"));
          done();
        });
    });

    it('it should POST a truck', (done) => {
      let truck = {
        truckWeight: 10
      }
      chai.request(app)
        .post('/truck')
        .send(truck)
        .end((_err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.not.have.property('error');
          res.body.should.have.property('id');
          done();
        });
    });
  });

  describe('/GET/:id truck', () => {
    it('it should GET a truck by the given id after creating it', (done) => {
      let truck = {
        truckWeight: 10
      }
      new TruckDB(truck).save((_err, truck) => {
        chai.request(app)
          .get('/truck/' + truck.id)
          .send()
          .end((_err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('truckWeight');
            res.body.should.have.property('totalWeight');
            res.body.should.have.property('totalParcels');
            res.body.should.have.property('_id').eql(truck.id);
            done();
          });
      });
    });

    it('it should not GET a truck by the given id that does not exist', (done) => {
      chai.request(app)
        .get('/truck/61967133c1626e60e9750f7a')
        .send()
        .end((_err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.not.have.property('truckWeight');
          res.body.should.not.have.property('totalWeight');
          res.body.should.not.have.property('totalParcels');
          res.body.should.not.have.property('_id').eql("61967133c1626e60e9750f7a");
          res.body.should.have.property('error');
          chai.assert(res.body.error.includes("Truck with id 61967133c1626e60e9750f7a not found"));
          done();
        });
    });

    it('it should not GET a truck by an invalid id', (done) => {
      chai.request(app)
        .get('/truck/61967133c1626e60e9750f7a12345g')
        .send()
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.not.have.property('truckWeight');
          res.body.should.not.have.property('totalWeight');
          res.body.should.not.have.property('totalParcels');
          res.body.should.not.have.property('_id').eql("61967133c1626e60e9750f7a");
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("Cast to ObjectId failed for value"));
          done();
        });
    });
  });

  describe('/GET getAllTrucks', () => {
    it('it should GET all the trucks', (done) => {
      chai.request(app)
        .get('/getAllTrucks')
        .end((_err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe('/DELETE/:id truck', () => {
    it('it should DELETE a truck given the id', (done) => {
      let truck = {
        truckWeight: 10
      }
      new TruckDB(truck).save((_err, truck) => {
        chai.request(app)
          .delete('/truck/' + truck.id)
          .end((_err, res) => {
            res.should.have.status(204);
            res.body.should.be.a('object');
            res.body.should.be.empty;
            done();
          });
      });
    });

    it('it should not DELETE a truck if it does not exist', (done) => {
      chai.request(app)
        .delete('/truck/61967133c1626e60e9750f7a')
        .end((_err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.includes("Truck with id 61967133c1626e60e9750f7a not found"));
          done();
        });
    });

    it('it should not DELETE a truck by an invalid id', (done) => {
      chai.request(app)
        .delete('/truck/61967133c1626e60e9750f7a12345g')
        .send()
        .end((_err, res) => {
          res.should.have.status(500);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.message.includes("Cast to ObjectId failed for value"));
          done();
        });
    });
  });
});

describe('Invalid Paths', () => {
  describe('/INVALID operation', () => {
    it('it should return error if any other path is hit or some path hit with incorrect http method', (done) => {
      chai.request(app)
        .get('/invalid')
        .send()
        .end((_err, res) => {
          res.should.have.status(501);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.includes("GET method is not implemented for path /invalid"));
        });
      chai.request(app)
        .get('/getParcels')
        .send()
        .end((_err, res) => {
          res.should.have.status(501);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          chai.assert(res.body.error.includes("GET method is not implemented for path /getParcels"));
          done();
        });
    });
  });
});

describe('Load-Unload Parcel', () => {

  beforeEach((done) => {
    ParcelDB.deleteMany({}, (_err) => {
      TruckDB.deleteMany({}, (_err) => {
        done();
      });
    });
  });

  afterEach((done) => {
    ParcelDB.deleteMany({}, (_err) => {
      TruckDB.deleteMany({}, (_err) => {
        done();
      });
    });
  });

  describe('/POST/:id load parcel', () => {
    it('it should return success when loading with valid parcel and truck ids', (done) => {
      let parcel = {
        name: "Dummy parcel 1",
        weight: 10
      }
      let truck = {
        truckWeight: 100
      }
      new ParcelDB(parcel).save((_err, parcel) => {
        new TruckDB(truck).save((_err, truck) => {
          let parcels = {
            "parcels": [parcel.id, parcel.id]
          }
          chai.request(app)
            .post('/loadTruck/' + truck.id)
            .send(parcels)
            .end((err, res) => {
              if (err) console.log(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              done();
            });
        });
      });
    });

    it('it should return failure when loading with valid parcel no existing truck', (done) => {
      let parcel = {
        name: "Dummy parcel 1",
        weight: 10
      }
      new ParcelDB(parcel).save((_err, parcel) => {
        let parcels = {
          "parcels": [parcel.id, parcel.id]
        }
        chai.request(app)
          .post('/loadTruck/61967133c1626e60e9750f7a')
          .send(parcels)
          .end((err, res) => {
            if (err) console.log(err);
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('error');
            chai.assert(res.body.error.includes("Truck with id 61967133c1626e60e9750f7a not found"));
            done();
          });
      });
    });
  });

  describe('/POST/:id unload parcel', () => {
    it('it should unload an existing parcel from an existing truck', (done) => {
      let parcel = {
        name: "Dummy parcel 1",
        weight: 10
      }
      let truck = {
        truckWeight: 100
      }
      new ParcelDB(parcel).save((_err, parcel) => {
        new TruckDB(truck).save((_err, truck) => {
          let parcels = {
            "parcels": [parcel.id, parcel.id]
          }
          chai.request(app)
            .post('/loadTruck/' + truck.id)
            .send(parcels)
            .end((err, res) => {
              if (err) console.log(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              chai.request(app)
                .post('/unloadTruck/' + truck.id)
                .send(parcels)
                .end((err, res) => {
                  if (err) console.log(err);
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  done();
                });
            });
        });
      });
    });

    it('it should return failure when unloading from non existing truck', (done) => {
      let parcel = {
        name: "Dummy parcel 1",
        weight: 10
      }
      new ParcelDB(parcel).save((_err, parcel) => {
        let parcels = {
          "parcels": [parcel.id, parcel.id]
        }
        chai.request(app)
          .post('/unloadTruck/61967133c1626e60e9750f7a')
          .send(parcels)
          .end((err, res) => {
            if (err) console.log(err);
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('error');
            chai.assert(res.body.error.includes("Truck with id 61967133c1626e60e9750f7a not found"));
            done();
          });
      });
    });
  });
});
