export default class User {
	constructor(login, parol){
    	this.login = login;
    	this.parol = parol;
    	this.isAdmin = false;
    	this.banUser = false;
	}
}