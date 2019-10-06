const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user');
const auth = require('../src/middlewares/auth');

const chai = require('chai');
const sinon = require('sinon');
const chaiHttp = require('chai-http');

let stubVerifyToken;
let stubVerifyAdminRolOnMyOwnUser;
let stubVerifyAdminUserRole;
let server;

const should = chai.should();
chai.use(chaiHttp);

describe('Users', () => {

    const urlBase = `/user`;
   
    beforeEach((done) => {
        
        // stub middleware
        stubVerifyToken = sinon.stub(auth, 'verifyUserToken').callsFake((req, res, next) => {
            req.user = { _id: '123456789123456789123456' }
            next()
        });
        stubVerifyAdminUserRole = sinon.stub(auth, 'verifyAdminUserRole').callsFake((req, res, next) =>  next() );
        stubVerifyAdminRolOnMyOwnUser = sinon.stub(auth, 'verifyAdminRolOnMyOwnUser').callsFake((req, res, next) =>  next() );

        // clear DB
        User.remove({}, (err) => done());
        
        // now we can create server
        server = require('../src/app');
    });

    afterEach((done) => {

        // restore stubs middlewares
        stubVerifyToken.restore();
        stubVerifyAdminUserRole.restore();
        stubVerifyAdminRolOnMyOwnUser.restore();
        done();
    });

    describe(`GET ${urlBase}`, () => {
        it('it should GET all users', (done) => {
            chai.request(server)
            .get(`${urlBase}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.payload.users.should.be.a('array');
                done();
            });
        });
    });

    describe(`POST ${urlBase}`, () => {
        it('it should not POST a user without email', (done) => {

            let body = {
                name: 'Hugo Ortiz',
                pass: '123456'
            };

            chai.request(server)
            .post(`${urlBase}`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
        });
        it('it should POST a new user', (done) => {

            let body = {
                name: 'Hugo Ortiz',
                email: 'hugo.er.ortiz@gmail.com',
                pass: '123456'
            };

            chai.request(server)
            .post(`${urlBase}`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.payload.should.be.a('object');
                res.body.payload.should.have.property('_id');
                done();
            });
        });
    });

    describe(`PUT ${urlBase}/:id`, () => {
        it('it should UPDATE a user given the ID', (done) => {

            let body = new User({
                name: 'Hugo Ortiz',
                email: 'hugo.er.ortiz@gmail.com',
                role: 'USER_ROLE',
                pass: '123456'
            });

            body.save((err, savedResp) => {

                body.name = 'Ortiz Hugo';

                chai.request(server)
                .put(`${urlBase}/${savedResp._id}`)
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.payload.should.be.a('object');
                    res.body.payload.name.should.be.eql('Ortiz Hugo');
                    done();
                });

            });
        });
    });

    describe(`DELETE ${urlBase}/:id`, () => {
        it('it should DELETE a user given the ID', (done) => {

            let body = new User({
                name: 'Hugo Ortiz',
                email: 'hugo.er.ortiz@gmail.com',
                role: 'USER_ROLE',
                pass: '123456'
            });

            body.save((err, savedResp) => {

                chai.request(server)
                .delete(`${urlBase}/${savedResp._id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.payload.should.be.a('object');
                    res.body.payload._id.should.be.eql(`${savedResp._id}`);
                    done();
                });

            });
        });
    });

});