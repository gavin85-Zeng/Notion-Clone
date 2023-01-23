const express = require('express');
const taskdb = require('./taskDB');
const pagedb = require('./pageDB');
const tabdb = require('./tabDB');

const router = express.Router();

router.get('/task', async (_req, _res) => {
	const query = _req.query;

	const from = query.from;
	const to = query.to;
	const isTrash = query.isTrash;
	const pageId = query.pageId;

	let filter = {};
	if (from !== undefined && to != undefined) {
		filter = {
			...filter,
			date: {
				$gte: new Date(parseInt(from)),
				$lte: new Date(parseInt(to)),
			},
		};
	}
	if (isTrash !== undefined) {
		filter = { ...filter, isTrash: isTrash };
	}
	if (pageId !== undefined) {
		filter = { ...filter, pageId: pageId };
	}

	console.log('fitler:   ', filter);

	const task = await taskdb.find(filter);
	console.log(task);
	_res.json(task);
});

router.get('/task/:id', async (_req, _res) => {
	const task = await taskdb.findById(_req.params.id);
	console.log(task);
	_res.json(task);
});

router.post('/task', async (_req, _res) => {
	const createData = _req.body;
	console.log('post body is : ', createData);
	const task = await taskdb.create(createData);
	console.log(task);
	_res.json(task);
});

router.put('/task/:id', async (_req, _res) => {
	const taskId = _req.params.id;
	const data = _req.body;
	const updated = await taskdb.update(taskId, data);
	console.log(updated);
	_res.json(updated);
});

router.delete('/task/:id', async (_req, _res) => {
	const taskId = _req.params.id;
	const deleted = await taskdb.delete(taskId);
	console.log(deleted);
	_res.json(deleted);
});

router.get('/pages', async (_req, _res) => {
	const pages = await pagedb.find();
	console.log(pages);
	_res.json(pages);
});

router.post('/pages', async (_req, _res) => {
	const newPage = _req.body;
	console.log('new page detail: ', newPage);
	const page = await pagedb.create(newPage);
	_res.json(page);
});

router.put('/pages/:id', async (_req, _res) => {
	const pageId = _req.params.id;
	const data = _req.body;

	const page = await pagedb.update(pageId, data);
	_res.json(page);
});

router.post('/pages/title/:id', async (_req, _res) => {
	const pageId = _req.params.id;
	const data = _req.body;

	console.log(pageId);
	const page = await pagedb.updateTitle(pageId, data);
	_res.json(page);
});

router.post('/pages/active/:id', async (_req, _res) => {
	const pageId = _req.params.id;
	const newPages = await pagedb.updateActiveFlag(pageId);
	_res.json(newPages);
});

router.delete('/pages/:id', async (_req, _res) => {
	const pageId = _req.params.id;
	const newPages = await pagedb.delete(pageId);
	_res.json(newPages);
});

router.get('/tabs', async (_req, _res) => {
	const tabs = await tabdb.find();
	_res.json(tabs);
});

router.get('/tabs/:pageId', async (_req, _res) => {
	const pageId = _req.params.pageId;
	console.log(`get tabs from id: ${pageId}`);
	const tabs = await tabdb.find({ pageId: pageId });
	console.log(`tabs: ${tabs}`);
	_res.json(tabs);
});

router.post('/tabs', async (_req, _res) => {
	const createData = _req.body;
	const tab = await tabdb.create(createData);
	_res.json(tab);
});

router.post('/tabs/active/:id', async (_req, _res) => {
	const tabId = _req.params.id;
	const pageId = _req.body.pageId;
	const newPages = await tabdb.updateTabActiveFlag(pageId, tabId);
	_res.json(newPages);
});

router.delete('/tabs/:id', async (_req, _res) => {
	const tabId = _req.params.id;
	const deleted = await tabdb.delete(tabId);
	_res.json(deleted);
});

router.put('/tabs/:id', async (_req, _res) => {
	const tabId = _req.params.id;
	const patch = _req.body;
	const updated = await tabdb.update(tabId, patch);
	_res.json(updated);
});

module.exports = router;
