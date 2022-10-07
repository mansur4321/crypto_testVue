import User from "./Class/User";
import Admin from "./Class/Admin";

export function regAdmin(login, parol) {
	return new Admin(login, parol);
}

export function regUser(login, parol) {
	return new User(login, parol);
}