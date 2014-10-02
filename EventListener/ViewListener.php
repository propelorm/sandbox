<?php

namespace PropelSandbox\EventListener;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseForControllerResultEvent;
use Symfony\Component\HttpKernel\EventListener\RouterListener;
use Symfony\Component\Routing\Matcher\UrlMatcher;
use Symfony\Component\Routing\RequestContext;

class ViewListener
{
    public function onKernelView(GetResponseForControllerResultEvent $event)
    {
        $data = array(
            'status' => 200,
            'data' => $event->getControllerResult()
        );

        $response = new Response();
        $response->setContent(json_encode($data, JSON_PRETTY_PRINT));
        $response->headers->set('Content-Type', 'application/json');
        $event->setResponse($response);
    }

}