const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const helper = require("./test_helper");
const api = supertest(app);

describe("One user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("secret", 10);
    const user = new User({
      username: "root",
      passwordHash,
    });

    await user.save();
  });

  test("Creation succeeds with fresh username", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "newUser",
      name: "newUser the First",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(
      usersAtStart.length + 1
    );

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("Cannot add a user with the same name", async () => {
    const usersAtStart = await helper.usersInDB();

    //console.log(usersAtStart);

    const newUser = {
      username: "root",
      name: "secondUser the good",
      password: "beep",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "expected `username` to be unique"
    );

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  // Add test for Get users here
});
