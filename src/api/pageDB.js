const mongoose = require('mongoose');
const crypto = require('crypto');
require('./connection');

const PageSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			default: () => crypto.randomUUID(),
		},
		title: {
			type: String,
			default: 'Untitled',
		},
		icon: {
			type: String,
			default: 'File',
		},
		isActive: {
			type: Boolean,
			default: false,
		},
		view: {
			type: String,
		},
		documentId: {
			type: String,
		},
	},
	{
		versionKey: false, // disable create generate __v
		timestamps: { timestamps: true }, // auto generate {createdAt, updatedAt}
	},
);

const Page = mongoose.model('Page', PageSchema);
module.exports.Page = Page;

module.exports.find = async (query) => {
	const pages = await Page.find(query).sort({ createdAt: 1 }).exec();
	return pages;
};

module.exports.create = async (data) => {
	const page = await Page.create(data);
	return page;
};

module.exports.update = async (id, data) => {
	const page = await Page.findByIdAndUpdate(id, data);
	return page;
};

module.exports.updateTitle = async (id, title) => {
	const page = await Page.findByIdAndUpdate(id, title);
	return page;
};

module.exports.updateActiveFlag = async (id) => {
	const oldActive = await Page.findOneAndUpdate(
		{ isActive: true },
		{ isActive: false },
		{
			new: true,
		},
	);
	const newActive = Page.findByIdAndUpdate(
		id,
		{ isActive: true },
		{
			new: true,
		},
	);
	return newActive;
};

module.exports.delete = async (id) => {
	const pages = await Page.findByIdAndDelete(id);
	const taskdb = require('./taskDB');
	const tabdb = require('./tabDB');
	const tab = await tabdb.Tab.deleteMany({ pageId: id });
	const task = await taskdb.Task.deleteMany({ pageId: id });
	return pages;
};
