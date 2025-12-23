const getStudioOverview = asyncHandler(async (req, res) => {
  const channelId = req.user._id;
  const days = Number(req.query.range || 30);

  const from = new Date();
  from.setUTCHours(0,0,0,0);
  from.setDate(from.getDate() - days + 1);

  const stats = await DailyChannelStats.find({
    channel: channelId,
    day: { $gte: from },
  }).sort({ day: 1 });

  const totalViews = stats.reduce((s, d) => s + d.views, 0);
  const watchHours =
    stats.reduce((s, d) => s + d.watchSeconds, 0) / 3600;
  const subscriberDelta =
    stats.reduce((s, d) => s + d.subscriberDelta, 0);

  res.json({
    totals: {
      views: totalViews,
      watchHours: Number(watchHours.toFixed(1)),
      subscribers: subscriberDelta,
    },
    graph: stats.map((d) => ({
      day: d.day,
      views: d.views,
      watchSeconds: d.watchSeconds,
      subscribers: d.subscriberDelta,
    })),
  });
});
