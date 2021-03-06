'use strict';

/* Controllers */

var ottappControllers = angular.module('ottapp.controllers', ['ngResource', 'smart-table']);

ottappControllers
    .controller('HomeController',
        ['$scope',
        function($scope) {
            /* Global Initialization */
            $scope.query   = {};
        }]
    );

ottappControllers
    .controller('StakeholderController',
        ['$scope', '$routeParams', 'esClient', 'esFactory', 'esQueryBuilder', 'esResultBuilder',
        function($scope, $routeParams, esClient, esFactory, esQueryBuilder, esResultBuilder) {
            esClient.search(
                esQueryBuilder.getDocumentQueryParams('ottprod', 'stakeholder', $routeParams.id)
            )
            .then(function(res) {
                var report    = {};
                report.document = esResultBuilder.getContent(res);
                report.found  = res.hits.hits.length == 0;
                report.took   = res.took / 1000;
                report.total  = res.hits.total;
                $scope.report = report;
            });
        }]
    );

ottappControllers
    .controller('DomainController',
        ['$scope', 'esClient', 'esFactory', 'esQueryBuilder', 'esResultBuilder',
        function($scope, esClient, esFactory, esQueryBuilder, esResultBuilder) {
            esClient.search(
                esQueryBuilder.getDomainParams('ottprod', 'stakeholder')
            )
            .then(function(res) {
                var report     = {};
                report.domains = esResultBuilder.getDomains(res);
                report.displayed_domains = [].concat(report.domains);
                report.found   = res.hits.hits.length == 0;
                report.took    = res.took / 1000;
                report.total   = res.hits.total;
                $scope.report  = report;
            });
        }]
    );

ottappControllers
    .controller('DomainListController',
        ['$scope', '$routeParams', 'esClient', 'esFactory', 'esQueryBuilder', 'esResultBuilder',
        function($scope, $routeParams, esClient, esFactory, esQueryBuilder, esResultBuilder) {
            esClient.search(
                esQueryBuilder.getDomainListParams('ottprod', 'stakeholder', $routeParams.id)
            )
            .then(function(res) {
                var report    = {};
                report.from_domain = $routeParams.id;
                report.responses = esResultBuilder.getDomainList(res);
                report.displayed_responses = [].concat(report.responses);
                report.found  = res.hits.hits.length == 0;
                report.took   = res.took / 1000;
                report.total  = res.hits.total;
                $scope.report = report;
            });
        }]
    );


ottappControllers
    .controller('SearchController',        
        ['$scope', '$location', 'esClient', 'esFactory', 'esQueryBuilder',
        function($scope, $location, esClient, esFactory, esQueryBuilder) {
            $scope.query   = {};

            $scope.search = function() {
                $location.path('/search');
                esClient.search({
                    index:'ottprod',
                    size: 100,
                    type: 'stakeholder',
                    body: {
                        _source: {
                            include: ['from_name', 'from', 'subject', 'snippet','date','size','campaigns']
                        },
                        query: {
                            bool: {
                                must: esQueryBuilder.getSearchQuery(
                                    $scope.query.name,
                                    $scope.query.email,
                                    $scope.query.content
                                )
                            }
                        },
                        highlight: {
                            pre_tags: ['<mark>'],
                            post_tags: ['</mark>'],
                            fields: { "text": {}}
                        }
                    }
                })
                .then(function(res) {
                    var results    = {}
                    results.hits   = res.hits.hits;
                    results.took   = res.took / 1000;
                    results.total  = res.hits.total;
                    results.timed_out = res.timed_out;
                    $scope.results = results;
                });
            }; /* end $scope.search function */
        }]
    );
