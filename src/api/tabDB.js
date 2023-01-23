const mongoose = require('mongoose');
const crypto = require('crypto');
require('./connection');

const TabSchma = new mongoose.Schema(
	{
		id: {
			type: String,
			default: () => crypto.randomUUID(),
		},
		pageId: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			default: 'New View',
		},
		isActive: {
			type: Boolean,
			default: false,
		},
		childElementName: {
			type: String,
		},
	},
	{
		versionKey: false, // disable create generate __v
		timestamps: { timestamps: true }, // auto generate {createdAt, updatedAt}
	},
);

const Tab = mongoose.model('Tab', TabSchma);
module.exports.Tab = Tab;

async function setToInactive(pageId) {
	return await Tab.updateMany({ pageId: pageId, isActive: true }, { $set: { isActive: false } });
}

module.exports.find = async (query) => {
	const tabs = await Tab.find(query).sort({ createdAt: 1 }).exec();
	return tabs;
};

module.exports.create = async (data) => {
	await setToInactive(data.pageId);
	const tab = await Tab.create(data);
	return tab;
};

module.exports.delete = async (id) => {
	const deleted = await Tab.findOneAndDelete({ id: id });
	return deleted;
};

module.exports.updateTabActiveFlag = async (pageId, id) => {
	await setToInactive(pageId);
	const newActive = await Tab.findOneAndUpdate(
		{ id: id },
		{ $set: { isActive: true } },
		{
			new: true,
		},
	);
	return newActive;
};

module.exports.update = async (id, patch) => {
	const updated = await Tab.findOneAndUpdate({ id: id }, patch, { new: true });
	return updated;
};
